const fs = require("fs"),
  path = require("path"),
  vm = require("vm"),
  assert = require("assert/strict"),
  ts = require("typescript");
const { JSDOM } = require("jsdom"),
  React = require("react"),
  { createRoot } = require("react-dom/client"),
  { act } = require("react-dom/test-utils");
const dom = new JSDOM('<div id="test"></div>', {
  url: "http://localhost:3006/class/join/" + "t".repeat(43),
});
for (const key of [
  "window",
  "document",
  "navigator",
  "localStorage",
  "sessionStorage",
  "Event",
  "HTMLElement",
])
  global[key] = dom.window[key];
global.IS_REACT_ACT_ENVIRONMENT = true;
const target = document.getElementById("test"),
  root = createRoot(target),
  calls = [],
  navigations = [];
let testSubscription;
let featureLanguage = "en";
const featurePhrases = JSON.parse(fs.readFileSync(path.join(__dirname,"../src/locales/feature-phrases.json"),"utf8"));
let token = "t".repeat(43),
  signedIn = false,
  pathname = "/teacher/register",
  search = "";
function compile(file, resolve) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync(path.resolve(__dirname, "../src", file), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
        },
      }
    ).outputText,
    {
      Error,
      navigator: dom.window.navigator,
      exports,
      require: resolve,
      window,
      document,
      localStorage,
      sessionStorage,
      Event,
      URL,
      URLSearchParams,
      Intl,
      fetch: async () => {
        throw Error("Unexpected network request");
      },
    },
    { filename: file }
  );
  return exports;
}
function common(name) {
  if (name.endsWith("feature-i18n")) {
    const tr = (source, values = {}) => (featureLanguage === "en" ? String(source ?? "") : featurePhrases[String(source ?? "")]?.[featureLanguage] || String(source ?? "")).replace(/\{\{(\w+)\}\}/g, (m,k) => k in values ? String(values[k]) : m);
    return { tr, featureLocale: () => featureLanguage, useFeatureLocale: () => ({locale:featureLanguage,dir:featureLanguage === "ar"?"rtl":"ltr",tr}) };
  }

  if (name === "react") return React;
  if (name === "react/jsx-runtime" || name === "lucide-react")
    return require(name);
  if (name === "react-redux")
    return {
      useSelector: (fn) =>
        fn({
          userAccount: {
            user: signedIn
              ? {
                  uuid: "test-user",
                  email: "teacher@example.test",
                  subscription: testSubscription,
                }
              : null,
          },
        }),
      useDispatch: () => () => {},
    };
  if (name === "react-router-dom")
    return {
      useLocation: () => ({ pathname, search }),
      useParams: () => ({ token }),
      useNavigate: () => (p) => navigations.push(p),
      Link: (p) => React.createElement("a", { href: p.to }, p.children),
      NavLink: (p) =>
        React.createElement(
          "a",
          {
            href: p.to,
            onClick: p.onClick,
            className:
              typeof p.className === "function"
                ? p.className({ isActive: pathname === p.to })
                : p.className,
          },
          p.children
        ),
      Navigate: (p) => {
        navigations.push(p.to);
        return null;
      },
    };
  return {};
}
const intent = compile("components/Teacher/AuthIntent.tsx", common).default;
const guest = compile("components/User/Exam/guest/guest-api.ts", () => ({}));
const api = compile("components/Teacher/api.ts", common);
const sidebarStyles = compile("components/Shared/sidebar-style.ts", () => ({}));
const ui = compile("components/Teacher/ui.tsx", (name) =>
  name === "./api" ? api : common(name)
);
let studentData = { classes: [], assignments: [], offers: [] },
  studentStartFails = false;
const Student = compile("components/Teacher/StudentClasses.tsx", (name) =>
  name === "./ui"
    ? ui
    : name === "./api"
    ? {
        ...api,
        teacherApi: async (p, m, b) => {
          calls.push({ p, m, b });
          if (p.endsWith("/preview"))
            return {
              name: "B1 Evening",
              teacher: "Aziz",
              sharing: "Only class-linked scores are shared.",
              consentVersion: "v1",
            };
          if (p.endsWith("/join")) return { joined: true };
          if (p === "student/classes") return studentData.classes;
          if (p === "student/assignments") return studentData.assignments;
          if (p === "student/seat-offers") return studentData.offers;
          if (p.endsWith("/accept")) {
            studentData.offers = studentData.offers.map((o) => ({
              ...o,
              state: "ACCEPTED",
            }));
            return { state: "ACCEPTED" };
          }
          if (p.endsWith("/leave")) {
            studentData = { classes: [], assignments: [], offers: [] };
            return {};
          }
          if (p.endsWith("/start") && studentStartFails)
            throw Error("Purchase required to start another exam.");

          return [];
        },
      }
    : name.includes("/api/user/")
    ? { requestGetUser: async () => ({}) }
    : name.includes("userAccount.actions")
    ? { updateUser: (x) => x }
    : common(name)
).default;
let roleStatus = "NOT_REGISTERED",
  roleFails = false;
const Role = compile("components/Teacher/TeacherRole.tsx", (name) =>
  name === "./api"
    ? {
        teacherApi: async () => {
          if (roleFails) throw Error("offline");
          return { status: roleStatus };
        },
      }
    : common(name)
);
const Navigation = compile("components/Teacher/TeacherNavigation.tsx", (name) =>
  name === "./TeacherRole"
    ? Role
    : name === "../Shared/sidebar-style"
    ? sidebarStyles
    : common(name)
);

let classroomList = [];
let savedInvite = "";
let detailStudents = [],
  detailAssignments = [],
  detailPerformance = [];
const detailApi = {
  ...api,
  teacherApi: async (p, m, b) => {
    if (p.endsWith("/students")) return detailStudents;
    if (p.endsWith("/assignments")) return detailAssignments;
    if (p.endsWith("/performance")) return detailPerformance;
    if (p === "teacher/exams")
      return [{ code: "B1", title: "TELC Deutsch B1" }];
    if (p.endsWith("/invites/rotate")) { savedInvite = "n".repeat(43); return { token: savedInvite }; }
    if (p.endsWith("/invites")) return { active: Boolean(savedInvite), token: savedInvite };
    return { id: "class-test", name: "B1 Evening", archived: false };
  },
};
const ClassDetail = compile(
  "components/Teacher/TeacherClassDetail.tsx",
  (name) => (name === "./ui" ? ui : name === "./api" ? detailApi : common(name))
).default;
const Teacher = compile("components/Teacher/TeacherPage.tsx", (name) => {
  if (name === "./ui") return ui;
  if (name === "./TeacherRole") return Role;
  if (name === "./TeacherNavigation") return Navigation;
  if (name === "./TeacherCheckoutReturn")
    return { __esModule: true, default: () => null };
  if (name === "./TeacherClassDetail")
    return { __esModule: true, default: () => null };
  if (name === "./api")
    return {
      ...api,
      teacherApi: async (p, m, b) => {
        if (p === "teacher/me")
          return { status: roleStatus, checkoutEnabled: false };
        if (p === "teacher/classes" && m === "POST") {
          classroomList.push({
            id: "new-class",
            name: b.name,
            archived: false,
          });
          return {};
        }
        if (p === "teacher/seats/pricing")
          return {
            tiers: [
              {
                code: "standard",
                label: "1–9",
                minimum: 1,
                maximum: 9,
                unitPriceCents: 1777,
              },
            ],
          };
        if (p.startsWith("teacher/seats/quote?"))
          return {
            quantity: 1,
            unitPriceCents: 1777,
            grossTotalCents: 1777,
            currency: "EUR",
          };
        if (p === "teacher/classes") return classroomList;
        if (p === "teacher/seats/wallet")
          return { available: 0, reserved: 0, activated: 0, offers: [] };
        if (p === "teacher/seats/orders") return [];
        if (p === "teacher/summary") return { students: 0, assignments: 0 };
        throw Error("Unexpected teacher API: " + p);
      },
    };
  return common(name);
}).default;
function Workspace() {
  return React.createElement(
    Role.TeacherRoleProvider,
    null,
    React.createElement(
      React.Fragment,
      null,
      React.createElement(Navigation.default, { onNavigate: () => {} }),
      React.createElement(
        "ul",
        null,
        React.createElement(Navigation.StudentClassesNavigation, {
          onNavigate: () => {},
        })
      )
    )
  );
}
let checkoutStatus = "PENDING",
  checkoutReads = 0,
  confirmedReturns = 0;
const PaymentReturn = compile(
  "components/Teacher/TeacherCheckoutReturn.tsx",
  (name) =>
    name === "./ui"
      ? ui
      : name === "./api"
      ? {
          ...api,
          teacherApi: async (p, m) => {
            assert.ok(p.startsWith("teacher/seats/orders/"));
            assert.ok(m === undefined || m === "GET");
            checkoutReads++;
            return {
              order: { status: checkoutStatus },
              seats: {
                purchased: checkoutStatus === "PAID" ? 15 : 0,
                assigned: 0,
                available: checkoutStatus === "PAID" ? 15 : 0,
                reserved: 0,
                activated: 0,
              },
            };
          },
        }
      : common(name)
).default;
const HistoryGroup = compile(
  "components/Shared/SidebarLinkGroup.tsx",
  common
).default;
const Sidebar = compile("components/User/Root/Sidebar.tsx", (name) => {
  if (name === "../../Shared/sidebar-style") return sidebarStyles;
  if (name === "../../Teacher/TeacherRole") return Role;
  if (name === "../../Teacher/TeacherNavigation") return Navigation;
  if (name === "../../Shared/SidebarLinkGroup")
    return { __esModule: true, default: HistoryGroup };
  if (name === "../../Shared/DarkModeSwitcher" || name === "./DropdownUser")
    return { __esModule: true, default: () => null };
  if (name === "react-i18next")
    return {
      useTranslation: () => ({
        i18n: { language: "en", resolvedLanguage: "en" },
      }),
    };
  if (name.includes("api/exam/api-helper"))
    return { getPassedUserExams: async () => [] };
  if (name.includes("api/user/api-helper"))
    return { requestGetUser: async () => null };
  if (name.includes("userAccount.actions")) return { updateUser: (x) => x };
  return common(name);
}).default;
function SidebarTest() {
  return React.createElement(
    Role.TeacherRoleProvider,
    null,
    React.createElement(Sidebar, {
      sidebarOpen: true,
      setSidebarOpen: () => {},
      setTheme: () => {},
    })
  );
}
const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
(async () => {
  await act(async () => root.render(React.createElement(intent)));
  assert.equal(
    sessionStorage.getItem("smartpruefung:class-auth-return"),
    "/teacher"
  );
  assert.equal(guest.authDestination(), "/teacher");
  pathname = "/class/join/" + token;
  await act(async () => root.render(React.createElement(intent)));
  assert.equal(guest.authDestination(), pathname);
  signedIn = true;
  await act(async () => root.render(React.createElement(intent)));
  assert.equal(sessionStorage.getItem("smartpruefung:class-auth-return"), null);
  sessionStorage.setItem("smartpruefung:class-auth-return", "//evil.example");
  assert.equal(guest.authDestination(), "/");
  sessionStorage.clear();
  await act(async () => root.render(React.createElement(Student)));
  await flush();
  assert.ok(target.textContent.includes("B1 Evening"));
  assert.ok(target.querySelector("[data-no-translate]"));
  let join = [...target.querySelectorAll("button")].find((b) =>
    b.textContent.includes("Agree and join")
  );
  assert.equal(join.disabled, true);
  assert.equal(calls.filter((c) => c.m === "POST").length, 0);
  await act(async () => target.querySelector('input[type="checkbox"]').click());
  assert.equal(join.disabled, false);
  await act(async () => join.click());
  await flush();
  assert.equal(calls.filter((c) => c.m === "POST").length, 1);
  assert.equal(calls.at(-1).p.endsWith("/preview"), true);
  assert.equal(calls.find((c) => c.m === "POST").b.consent, true);
  assert.equal(navigations.at(-1), "/my-classes");
  assert.equal(
    [...target.querySelectorAll("a")].some((a) => a.href.includes("/teacher")),
    false,
    "Students must not see teacher navigation"
  );
  sessionStorage.clear();
  pathname = "/my-classes";
  signedIn = true;
  await act(async () => root.render(React.createElement(Workspace)));
  await flush();
  assert.ok(target.textContent.includes("My classes"));
  assert.equal(target.textContent.includes("Teacher workspace"), false);
  roleStatus = "ACTIVE";
  await act(async () =>
    window.dispatchEvent(new Event(Role.teacherRoleChanged))
  );
  await flush();
  assert.ok(target.textContent.includes("Teacher workspace"));
  assert.ok(target.textContent.includes("Dashboard"));
  assert.ok(target.textContent.includes("Exam seats"));
  assert.equal(target.textContent.includes("My classes"), false);
  assert.equal(target.textContent.includes("For Teachers"), false);
  roleStatus = "NOT_REGISTERED";
  await act(async () =>
    window.dispatchEvent(new Event(Role.teacherRoleChanged))
  );
  await flush();
  assert.ok(target.textContent.includes("My classes"));
  assert.equal(target.querySelector('a[href="/teacher"]'), null);
  roleFails = true;
  await act(async () =>
    window.dispatchEvent(new Event(Role.teacherRoleChanged))
  );
  await flush();
  assert.equal(target.querySelector('a[href="/teacher"]'), null);
  roleFails = false;
  pathname = "/teacher";
  roleStatus = "ACTIVE";
  await act(async () => root.render(React.createElement(Teacher)));
  await flush();
  assert.ok(target.textContent.includes("Your teaching workspace"));
  assert.ok(target.textContent.includes("Get your class started"));
  assert.equal(target.textContent.includes("My student account"), false);
  const create = [...target.querySelectorAll("button")].find(
    (b) => b.textContent === "Create class"
  );
  await act(async () => create.click());
  assert.ok(target.querySelector('[role="dialog"]'));
  assert.ok(target.querySelector('label[for="new-class-name"]'));
  const nameField = target.querySelector("#new-class-name");
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set.call(nameField, "B1 Sunday");
    nameField.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
  // Close by keyboard; dialog focus returns to the original action.
  await act(async () =>
    document.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    )
  );
  assert.equal(target.querySelector('[role="dialog"]'), null);
  await act(async () => root.render(React.createElement("div")));
  roleStatus = "NOT_REGISTERED";
  await act(async () => root.render(React.createElement(Teacher)));
  await flush();
  assert.equal(navigations.at(-1), "/my-classes");
  assert.equal(target.textContent.includes("Register as a teacher"), false);
  await act(async () =>
    root.render(
      React.createElement(ClassDetail, {
        key: "empty",
        id: "class-test",
        availableSeats: 1,
        busy: false,
        run: async (fn) => {
          await fn();
          return true;
        },
        notify: () => {},
      })
    )
  );
  await flush();
  assert.ok(target.textContent.includes("Your students will appear here"));
  assert.ok(target.querySelector('[role="tablist"]'));
  await act(async () =>
    [...target.querySelectorAll("button")]
      .find((b) => b.textContent === "Invite students")
      .click()
  );
  assert.ok(
    target
      .querySelector('[role="dialog"]')
      .textContent.includes("Create invitation link")
  );
  await act(async () =>
    [...target.querySelectorAll("button")]
      .find((b) => b.textContent.includes("Create invitation link"))
      .click()
  );
  await flush();
  assert.equal(
    target.querySelector("#class-invitation").value,
    "http://localhost:3006/class/join/" + "n".repeat(43)
  );
  await act(async () =>
    document.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    )
  );
  detailStudents = [{ studentId: "s1", name: "Student One", access: "Free" }];
  await act(async () =>
    root.render(
      React.createElement(ClassDetail, {
        key: "roster",
        id: "class-test",
        availableSeats: 1,
        busy: false,
        run: async (fn) => {
          await fn();
          return true;
        },
        notify: () => {},
      })
    )
  );
  await flush();
  assert.ok(target.textContent.includes("Student One"));
  // Remounting the class loses local state; the saved link still loads from the server.
  await act(async () => [...target.querySelectorAll("button")].find((b) => b.textContent === "Invite students").click());
  await flush();
  assert.equal(target.querySelector("#class-invitation").value, "http://localhost:3006/class/join/" + savedInvite);
  let copiedLink = "";
  Object.defineProperty(dom.window.navigator, "clipboard", { configurable: true, value: { writeText: async (value) => { copiedLink = value; } } });
  await act(async () => [...target.querySelectorAll("button")].find((b) => b.textContent.trim() === "Copy").click());
  assert.equal(copiedLink, "http://localhost:3006/class/join/" + savedInvite);
  assert.ok(target.textContent.includes("Copied"));
  await act(async () => document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));

  await act(async () =>
    [...target.querySelectorAll("button")]
      .find((b) => b.textContent === "Assign exam")
      .click()
  );
  assert.ok(target.querySelector('[role="dialog"]'));
  assert.equal(target.querySelector('input[value="all"]').checked, true);
  assert.equal(target.querySelector('input[value="selected"]').checked, false);
  await act(async () =>
    target.querySelector('input[value="selected"]').click()
  );
  assert.ok(target.querySelector('input[type="checkbox"]'));
  assert.ok(target.querySelector('label[for="assignment-due"]'));
  await act(async () =>
    document.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    )
  );
  await act(async () =>
    [...target.querySelectorAll("button")]
      .find((b) => b.textContent === "Offer exam access")
      .click()
  );
  assert.ok(
    target
      .querySelector('[role="dialog"]')
      .textContent.includes("no additional charge")
  );
  assert.ok(target.textContent.includes("60 days from student acceptance"));

  token = undefined;
  pathname = "/my-classes";
  studentData = {
    classes: [{ id: "c1", name: "B1 Monday", archived: false }],
    assignments: [
      {
        id: "todo",
        examCode: "TELC_B1",
        className: "B1 Monday",
        status: "ASSIGNED",
        dueAt: "2030-12-01T16:00:00Z",
      },
      {
        id: "running",
        examCode: "TELC_B1",
        className: "B1 Monday",
        status: "IN_PROGRESS",
        attemptId: "running-session",
        dueAt: null,
      },
      {
        id: "done",
        examCode: "TELC_B1",
        className: "B1 Monday",
        status: "EVALUATED",
        attemptId: "done-session",
        dueAt: null,
      },
    ],
    offers: [
      {
        id: "offered",
        className: "B1 Monday",
        state: "PENDING",
        expiresAt: "2030-12-01T16:00:00Z",
        canAccept: true,
      },
    ],
  };
  await act(async () =>
    root.render(React.createElement(Student, { key: "student-dashboard" }))
  );
  await flush();
  assert.ok(target.textContent.includes("B1 Monday"));
  assert.ok(target.textContent.includes("Assignments to do"));
  assert.ok(target.textContent.includes("Review offer"));
  assert.equal(target.querySelector('a[href="/teacher"]'), null);
  const sectionButton = (label) =>
    [
      ...target
        .querySelector('[aria-label="My classes sections"]')
        .querySelectorAll("button"),
    ].find((b) => b.textContent.includes(label));
  await act(async () => sectionButton("Assignments").click());
  assert.ok(target.querySelector('a[href="/"]'));
  assert.equal(
    target.querySelector('a[href="/exams/done-session/review"]'),
    null
  );
  await act(async () =>
    [...target.querySelectorAll("button")]
      .find((b) => b.textContent === "Completed")
      .click()
  );
  assert.ok(target.querySelector('a[href="/exams/done-session/review"]'));
  assert.equal(target.textContent.includes("Start assigned exam"), false);
  await act(async () =>
    [...target.querySelectorAll("button")]
      .find((b) => b.textContent === "To do")
      .click()
  );
  studentStartFails = true;
  const previousNavigation = navigations.length;
  await act(async () =>
    [...target.querySelectorAll("button")]
      .find((b) => b.textContent.includes("Start assigned exam"))
      .click()
  );
  await flush();
  assert.ok(target.textContent.includes("Purchase required"));
  assert.equal(navigations.length, previousNavigation);
  assert.equal(
    [...target.querySelectorAll("button")].find((b) =>
      b.textContent.includes("Start assigned exam")
    ).disabled,
    false
  );
  studentStartFails = false;
  await act(async () => sectionButton("Exam access").click());
  await act(async () =>
    [...target.querySelectorAll("button")]
      .find((b) => b.textContent.includes("Accept offer"))
      .click()
  );
  assert.ok(
    target
      .querySelector('[role="dialog"]')
      .textContent.includes("won’t be charged")
  );
  await act(async () =>
    [...target.querySelectorAll("button")]
      .find((b) => b.textContent.includes("Confirm and start access"))
      .click()
  );
  await flush();
  assert.ok(
    calls.some(
      (c) => c.p === "student/seat-offers/offered/accept" && c.m === "POST"
    )
  );
  assert.equal(target.querySelector('[role="dialog"]'), null);
  assert.ok(target.textContent.includes("Previous offers"));
  await act(async () => sectionButton("Classes").click());
  await act(async () =>
    [...target.querySelectorAll("button")]
      .find((b) => b.textContent === "Sharing settings")
      .click()
  );
  assert.ok(
    target
      .querySelector('[role="dialog"]')
      .textContent.includes(
        "exam history and activated paid access stay with you"
      )
  );
  await act(async () =>
    [...target.querySelectorAll("button")]
      .find((b) => b.textContent === "Leave class")
      .click()
  );
  await flush();
  assert.ok(calls.some((c) => c.p === "student/classes/c1/leave"));
  assert.ok(target.textContent.includes("Learn together with your class"));
  await act(async () =>
    [...target.querySelectorAll("button")]
      .find((b) => b.textContent === "Join a class")
      .click()
  );
  const invitationInput = target.querySelector("#student-invite-link");
  await act(async () =>
    require("react-dom/test-utils").Simulate.change(invitationInput, {
      target: { value: "https://other.example/class/join/" + "t".repeat(43) },
    })
  );
  await act(async () =>
    require("react-dom/test-utils").Simulate.submit(
      invitationInput.closest("form")
    )
  );
  assert.ok(
    target
      .querySelector('[role="dialog"]')
      .textContent.includes("Paste the full SmartPrüfung")
  );
  await act(async () =>
    require("react-dom/test-utils").Simulate.change(invitationInput, {
      target: { value: "http://localhost:3006/class/join/" + "t".repeat(43) },
    })
  );
  await act(async () =>
    require("react-dom/test-utils").Simulate.submit(
      invitationInput.closest("form")
    )
  );
  assert.equal(navigations.at(-1), "/class/join/" + "t".repeat(43));
  assert.equal(sidebarStyles.sidebarLink(true).includes("bg-gray-100"), true);
  assert.equal(
    sidebarStyles.sidebarTitle.includes("text-base font-bold"),
    true
  );

  pathname = "/teacher";
  roleStatus = "ACTIVE";
  testSubscription = { plan: "free", quota: 1 };
  await act(async () => root.render(React.createElement(SidebarTest)));
  await flush();
  const titles = [...target.querySelectorAll("h3")];
  assert.ok(titles.some((h) => h.textContent === "Personal practice"));
  assert.equal(
    new Set(titles.map((h) => h.className)).size,
    1,
    "All sidebar titles use Personal practice typography"
  );
  const sidebarLinks = [...target.querySelectorAll("nav a")];
  assert.ok(sidebarLinks.length >= 7);
  assert.ok(
    sidebarLinks.every((a) => a.className.includes("text-base font-normal"))
  );
  assert.equal(target.querySelector('a[href="/my-classes"]'), null);
  const historyButton = [...target.querySelectorAll("button")].find((b) =>
    b.textContent.includes("Exam history")
  );
  await act(async () => historyButton.click());
  assert.equal(historyButton.getAttribute("aria-expanded"), "true");
  assert.equal(target.querySelector("#sidebar-exam-history").hidden, false);
  assert.ok(target.querySelector('a[href="/exams"]'));
  roleStatus = "NOT_REGISTERED";
  testSubscription = {
    plan: "b1",
    isActive: true,
    status: "active",
    endDate: "2030-12-01",
  };
  await act(async () =>
    window.dispatchEvent(new Event(Role.teacherRoleChanged))
  );
  await flush();
  await act(async () => root.render(React.createElement(SidebarTest)));
  await flush();
  assert.ok(target.querySelector('a[href="/my-classes"]'));
  assert.equal(target.querySelector('a[href="/teacher"]'), null);
  assert.equal(
    target.querySelector('a[href="/pricing"]'),
    null,
    "Paid students keep My classes independently of Plans"
  );

  pathname = "/teacher/seats";
  roleStatus = "ACTIVE";
  search = "";
  await act(async () =>
    root.render(React.createElement(Teacher, { key: "seat-pricing" }))
  );
  await flush();
  assert.ok(
    target.textContent.includes("€17.77"),
    "Teacher prices come from the backend schedule"
  );
  assert.equal(target.textContent.includes("€19.99"), false);
  await act(async () => root.render(React.createElement("div")));
  const originalTimer = window.setTimeout;
  let poll;
  window.setTimeout = (fn) => {
    poll = fn;
    return 12345;
  };
  const onConfirmed = async () => {
    confirmedReturns++;
  };
  try {
    await act(async () =>
      root.render(
        React.createElement(PaymentReturn, {
          orderId: "teacher-order",
          onConfirmed,
        })
      )
    );
    await flush();
    assert.ok(target.textContent.includes("Confirming your payment"));
    assert.equal(target.textContent.includes("Payment confirmed"), false);
    assert.equal(confirmedReturns, 0);
    assert.equal(checkoutReads, 1);
    checkoutStatus = "PAID";
    await act(async () => poll());
    await flush();
    assert.ok(target.textContent.includes("Payment confirmed"));
    assert.ok(target.textContent.includes("15 exam seats"));
    assert.ok(target.textContent.includes("Purchased"));
    assert.ok(target.textContent.includes("Assigned"));
    assert.ok(target.textContent.includes("Available"));
    assert.equal(confirmedReturns, 1);
    await act(async () => root.render(React.createElement("div")));
    checkoutStatus = "FAILED";
    await act(async () =>
      root.render(
        React.createElement(PaymentReturn, {
          orderId: "failed-order",
          onConfirmed,
        })
      )
    );
    await flush();
    assert.equal(target.textContent.includes("Payment confirmed"), false);
    assert.ok(target.textContent.includes("needs attention"));
  } finally {
    window.setTimeout = originalTimer;
  }
  token = undefined; pathname = "/my-classes"; signedIn = true;
  studentData = { classes:[{id:"c-locale",name:"Private class name",archived:false}],assignments:[],offers:[] };
  for (const lang of ["en","de","fr","ar","uk","tr"]) {
    featureLanguage = lang;
    await act(async () => root.render(React.createElement(Student,{key:"language-"+lang})));
    await flush();
    const region = target.querySelector("section[lang]");
    assert.equal(region.lang,lang);
    assert.equal(region.dir,lang === "ar"?"rtl":"ltr");
    assert.equal(target.querySelector("h1").textContent,lang === "en"?"My classes":featurePhrases["My classes"][lang]);
    assert.ok(target.textContent.includes("Private class name"));
    const assignmentsTab = [...target.querySelectorAll('nav button')].find((b)=>b.textContent.includes(lang === "en"?"Assignments":featurePhrases.Assignments[lang]));
    assert.ok(assignmentsTab);
    await act(async () => assignmentsTab.click());
    assert.ok(target.textContent.includes(lang === "en"?"No assignments yet":featurePhrases["No assignments yet"][lang]));
  }
  roleStatus = "ACTIVE"; pathname = "/teacher/seats";
  for (const lang of ["en","de","fr","ar","uk","tr"]) {
    featureLanguage = lang;
    await act(async () => root.render(React.createElement(Teacher,{key:"teacher-language-"+lang})));
    await flush();
    assert.equal(target.querySelector("h1").textContent,lang === "en"?"Exam seats":featurePhrases["Exam seats"][lang]);
    assert.ok(target.textContent.includes(new Intl.NumberFormat(lang,{style:"currency",currency:"EUR"}).format(17.77)));
  }
  featureLanguage = "ar";
  await act(async () => root.render(React.createElement(ClassDetail,{key:"arabic-keyboard",id:"class-test",availableSeats:1,busy:false,run:async(fn)=>{await fn();return true;},notify:()=>{}})));
  await flush();
  await act(async () => target.querySelector("#tab-students").dispatchEvent(new window.KeyboardEvent("keydown",{key:"ArrowLeft",bubbles:true})));
  assert.equal(target.querySelector("#tab-assignments").getAttribute("aria-selected"),"true");
  featureLanguage = "en";
  await act(async () => root.unmount());
  console.log(
    "Teacher checkout and account UI checks passed: server-fed pricing, webhook-confirmed return status, pending/failed payment handling, role isolation, shared sidebar styles, class and assignment tabs, completed reviews, failed-start recovery, offer acceptance, sharing withdrawal, safe invitation links and affirmative consent."
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => dom.window.close());
