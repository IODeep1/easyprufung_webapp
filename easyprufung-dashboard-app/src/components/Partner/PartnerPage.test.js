import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import {tr} from "../../localization/feature-i18n";
import featureCatalog from "../../locales/feature-phrases.json";
i18n.use(initReactI18next).init({lng:"en",fallbackLng:"en",initImmediate:false,resources:Object.fromEntries(["en","de","ar","fr","uk","tr"].map(l=>[l,{translation:{}}]))});
import React from "react";
import { createRoot } from "react-dom/client";
import { act, Simulate } from "react-dom/test-utils";
import PartnerPage from "./PartnerPage";
import AuthIntent, {
  classAuthDestination,
  classReturnKey,
} from "../Teacher/AuthIntent";
import { authDestination } from "../User/Exam/guest/guest-api";
import { teacherApi } from "../Teacher/api";
let mockPath = "/partners/register",
  mockSignedIn = false;
jest.mock("react-redux", () => ({ useSelector: selector => selector({userAccount: {user: mockSignedIn ? {uuid:"account-1", email:"registered@example.com"} : undefined}}) }));
jest.mock("react-router-dom", () => ({
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: mockPath, search: "" }),
}));
jest.mock("../../api/exam/api-helper", () => ({ ExamApiError: Error }));
jest.mock("../Teacher/api", () => ({
  teacherApi: jest.fn(),
  button: "button",
  secondary: "secondary",
  input: "input",
  card: "card",
}));
let root, container, profile;
const findButton = (text) =>
  [...container.querySelectorAll("button")].find((b) => b.textContent === text);
async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}
beforeEach(async () => {
  await i18n.changeLanguage("en");
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  sessionStorage.clear();
  localStorage.clear();
  mockPath = "/partners/register";
  mockSignedIn = false;
  profile = { status: "NOT_REGISTERED" };
  Object.defineProperty(global, "crypto", {
    configurable: true,
    value: { randomUUID: () => "test-request-0001" },
  });
  teacherApi.mockImplementation(async (path) =>
    path === "partners/me"
      ? profile
      : path.includes("overview")
      ? { availableCents: 5000, pendingCents: 302, lifetimeQualifiedUses: 4 }
      : path.includes("codes")
      ? [{ id: "code-1", displayCode: "ANNA10" }]
      : { content: [], totalElements: 0 }
  );
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  jest.clearAllMocks();
});
test("partner registration returns to partner application even with a saved guest exam", async () => {
  localStorage.setItem(
    "smartpruefung:guest-exam:v1",
    JSON.stringify({ token: "old-guest", pending: true })
  );
  act(() => root.render(<AuthIntent />));
  expect(sessionStorage.getItem(classReturnKey)).toBe("/partners");
  expect(classAuthDestination()).toBe("/partners");
  expect(authDestination()).toBe("/partners");
  mockSignedIn = true;
  mockPath = "/partners";
  act(() => root.render(<AuthIntent />));
  expect(sessionStorage.getItem(classReturnKey)).toBe(null);
  expect(localStorage.getItem("smartpruefung:guest-exam:v1")).toContain(
    "old-guest"
  );
});
function change(selector,value){act(()=>Simulate.change(container.querySelector(selector),{target:{value}}));}
async function submitStep(){await act(async()=>{Simulate.submit(container.querySelector("form"));});await flush();}
async function fillDetails(){change('[name="displayName"]',"Partner Example");change('[name="contactEmail"]',"contact@example.com");change('[name="countrySearch"]',"Germany");act(()=>Simulate.click([...container.querySelectorAll('[role="option"] button')].find(b=>b.textContent.includes("Germany"))));await submitStep();}
async function fillAudience(){const inputs=container.querySelectorAll('input');act(()=>Simulate.change(inputs[0],{target:{value:"@germanlearners"}}));change('textarea',"I help German learners prepare for their B1 exams.");await submitStep();}
test("application uses three steps, prefills email, preserves edits and includes flagged country choices",async()=>{
 mockSignedIn=true;act(()=>root.render(<PartnerPage/>));await flush();
 expect(container.querySelector("section").lang).toBe("en");
 expect(container.querySelector('[name="contactEmail"]').value).toBe("registered@example.com");
 act(()=>Simulate.focus(container.querySelector('[name="countrySearch"]')));
 expect(container.querySelectorAll('[role="option"]').length).toBeGreaterThan(240);
 change('[name="countrySearch"]',"germ");
 expect(container.querySelector('[role="option"]').textContent).toContain("🇩🇪Germany");
 expect(container.querySelector('[aria-label="Application steps"]')).toBeNull();
 expect(container.textContent).not.toContain("Your partner account also includes Teacher Mode");
 expect(container.querySelector('[name="iban"]')).toBeNull();
 await submitStep();expect(container.textContent).toContain("Let’s get to know you");
 await fillDetails();expect(container.textContent).toContain("Tell us who you reach");
 act(()=>Simulate.click(findButton("Back")));expect(container.querySelector('[name="contactEmail"]').value).toBe("contact@example.com");
 await submitStep();
 const platforms=[...container.querySelectorAll('select option')].map(o=>o.value);
 expect(platforms).toEqual(expect.arrayContaining(["Instagram","YouTube","Facebook","TikTok","LinkedIn"]));
 await fillAudience();expect(container.textContent).toContain("Choose how you get paid");
 expect(container.textContent).not.toContain("Your application at a glance");
 expect(container.querySelector('input[type="checkbox"]').required).toBe(true);
 change('[name="method"]',"BANK");expect(container.textContent).toContain("IBAN");expect(container.textContent).not.toContain("PayPal email");
 expect(container.querySelector('input[type="checkbox"]').checked).toBe(false);
 expect(teacherApi.mock.calls.filter(([path,method])=>path==="partners/apply"&&method==="POST")).toHaveLength(0);
});
test("final application submits all stages once and keeps the adjusted email",async()=>{
 act(()=>root.render(<PartnerPage/>));await flush();await fillDetails();await fillAudience();
 change('[name="holder"]',"Partner Example");change('[name="paypalEmail"]',"payout@example.com");
 act(()=>Simulate.change(container.querySelector('input[type="checkbox"]'),{target:{checked:true}}));
 await submitStep();const submitted=teacherApi.mock.calls.find(([path,method])=>path==="partners/apply"&&method==="POST");
 expect(submitted[2]).toEqual(expect.objectContaining({contactEmail:"contact@example.com",country:"DE",termsAccepted:true,payout:expect.objectContaining({paypalEmail:"payout@example.com"})}));
});
test("approved dashboard shows separate balances and payout request uses an idempotency key", async () => {
  profile = {
    id: "partner-1",
    status: "APPROVED",
    commissionBps: 2000,
    discountBps: 1000,
    payoutMethod: "PAYPAL",
    payoutMasked: "a•••@mail.com",
    payoutVerified: true,
  };
  global.fetch = jest.fn(async () => ({ ok: true }));
  localStorage.setItem("access-token", "account-token");
  act(() => root.render(<PartnerPage />));
  await flush();
  expect(container.textContent).toContain("ANNA10");
  expect(container.textContent).toContain("Pending");
  expect(container.textContent).toContain("Paid lifetime");
  expect(findButton("Request payout").disabled).toBe(false);
  await act(async () => {
    Simulate.click(findButton("Request payout"));
  });
  await flush();
  expect(fetch).toHaveBeenCalledWith(
    "/api/partners/me/payout-requests",
    expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        "Idempotency-Key": "test-request-0001",
        Authorization: "Bearer account-token",
      }),
    })
  );
});
test("pending partner has no active code or payout action", async () => {
  profile = {
    id: "partner-1",
    status: "PENDING",
    payoutMasked: "a•••@mail.com",
    payoutVerified: false,
  };
  act(() => root.render(<PartnerPage />));
  await flush();
  expect(container.textContent).not.toContain("Your discount codes");
  expect(findButton("Request payout").disabled).toBe(true);
});

test("partner profile and payout preferences can be edited inline in settings",async()=>{
 profile={id:"partner-1",status:"APPROVED",displayName:"Existing Partner",contactEmail:"original@example.com",country:"DE",website:"",approach:"I help learners with German exam preparation.",socials:[{platform:"Facebook",profile:"@learnergroup"}],payoutMethod:"PAYPAL",payoutMasked:"a•••@mail.com",payoutVerified:true};
 act(()=>root.render(<PartnerPage settingsMode/>));await flush();
 expect(container.textContent).toContain("Partner profile");expect(container.textContent).not.toContain("Commission history");
 act(()=>Simulate.click(findButton("Edit partner profile")));change('[name="contactEmail"]',"updated@example.com");await submitStep();expect(findButton("Save profile")).toBeDefined();await submitStep();
 const update=teacherApi.mock.calls.find(([path,method])=>path==="partners/me"&&method==="PUT");expect(update[2].contactEmail).toBe("updated@example.com");
 act(()=>Simulate.click(findButton("Update payout method")));expect(container.querySelector('[name="paypalEmail"]')).not.toBeNull();
 expect(teacherApi.mock.calls.some(([path,method])=>path==="partners/apply"&&method==="POST")).toBe(false);
});

const approvedProfile = () => ({id:"partner-1",status:"APPROVED",displayName:"Partner Example",commissionBps:2000,discountBps:1000,payoutVerified:true,payoutMethod:"BANK",payoutMasked:"DE •••• 3000"});
const analyticsFixture = () => ({timezone:"UTC",asOf:"2026-11-24T12:00:00Z",months:["2026-06","2026-07","2026-08","2026-09","2026-10","2026-11"].map((month,i)=>({month,earnedCents:i===5?800:0,adjustmentCents:i===4?-300:0,netCents:i===5?800:i===4?-300:0,qualifiedPurchases:i===5?24:0}))});
function withAnalytics() {const previous=teacherApi.getMockImplementation();teacherApi.mockImplementation(async(path,...args)=>path==="partners/me/analytics"?analyticsFixture():previous(path,...args));}
test("workspace charts use full analytics, preserve negative adjustments and switch calendar periods",async()=>{
 profile=approvedProfile();withAnalytics();act(()=>root.render(<PartnerPage/>));await flush();
 expect(container.querySelectorAll('svg[role="img"]')).toHaveLength(2);
 expect(container.textContent).toContain("€5.00");expect(container.textContent).toContain("24");
 act(()=>Simulate.click([...container.querySelectorAll('summary')].find(b=>b.textContent==="View chart data")));
 const table=container.querySelector('table');expect(table.textContent).toContain("October 2026");expect(table.textContent).toContain("-€3.00");
 expect(table.querySelectorAll('tbody tr')).toHaveLength(6);
 act(()=>Simulate.click(findButton("3 months")));expect(container.querySelector('table').querySelectorAll('tbody tr')).toHaveLength(3);
 expect(findButton("3 months").getAttribute("aria-pressed")).toBe("true");
 expect(container.querySelector('svg[role="img"]').getAttribute('aria-label')).toContain("€5.00 total");
});
test("workspace separates histories and shows readable payout status",async()=>{
 profile=approvedProfile();withAnalytics();const previous=teacherApi.getMockImplementation();teacherApi.mockImplementation(async(path,...args)=>path.includes('me/payouts')?{content:[{id:"p1",createdAt:"2026-11-20T12:00:00Z",amountCents:5000,status:"MARKED_PAID",maskedDestination:"DE •••• 3000",externalReference:"bank-123",paidAt:"2026-11-21T12:00:00Z"}],totalElements:1}:previous(path,...args));
 act(()=>root.render(<PartnerPage/>));await flush();expect(container.textContent).not.toContain("Payout history");
 act(()=>Simulate.click(findButton("Payouts")));expect(container.textContent).toContain("Payout history");expect(container.textContent).toContain("bank-123");expect(container.textContent).not.toContain("MARKED_PAID");
 act(()=>Simulate.click(findButton("Commissions")));expect(container.textContent).toContain("Your first commission starts here");expect(container.textContent).not.toContain("Payout history");
 act(()=>Simulate.click(findButton("Overview")));expect(container.querySelectorAll('svg[role="img"]')).toHaveLength(2);
});
test("chart failures are distinct from zero activity and can be retried",async()=>{
 profile=approvedProfile();const previous=teacherApi.getMockImplementation();let failed=true;teacherApi.mockImplementation(async(path,...args)=>{if(path==="partners/me/analytics"){if(failed)throw Error("unavailable");return analyticsFixture();}return previous(path,...args);});
 act(()=>root.render(<PartnerPage/>));await flush();expect(container.textContent).toContain("Charts are unavailable");expect(findButton("Request payout").disabled).toBe(false);expect(container.querySelector('svg[role="img"]')).toBeNull();
 failed=false;await act(async()=>Simulate.click(findButton("Retry charts")));await flush();expect(container.querySelectorAll('svg[role="img"]')).toHaveLength(2);
});
test("failed balances never display a fabricated empty workspace and retry recovers",async()=>{
 profile=approvedProfile();withAnalytics();let failed=true;const previous=teacherApi.getMockImplementation();teacherApi.mockImplementation(async(path,...args)=>{if(path.includes("overview")&&failed)throw Error("Balance service unavailable");return previous(path,...args);});
 act(()=>root.render(<PartnerPage/>));await flush();expect(container.textContent).toContain("Balance service unavailable");expect(container.querySelector('nav[aria-label="Partner pages"]')).toBeNull();expect(findButton("Request payout")).toBeUndefined();
 failed=false;await act(async()=>Simulate.click(findButton("Try again")));await flush();expect(findButton("Request payout").disabled).toBe(false);
});
test("payout eligibility explains unverified destinations and negative carry-forward",async()=>{
 profile={...approvedProfile(),payoutVerified:false};withAnalytics();const previous=teacherApi.getMockImplementation();teacherApi.mockImplementation(async(path,...args)=>path.includes("overview")?{availableCents:-302,minimumPayoutCents:5000}:previous(path,...args));
 act(()=>root.render(<PartnerPage/>));await flush();expect(findButton("Request payout").disabled).toBe(true);expect(container.textContent).toContain("administrator verification");expect(container.textContent).toContain("-€3.02");expect(container.querySelector("progress").value).toBe(0);
});
test("sharing copies a code and includes commission disclosure in the sharing text",async()=>{
 profile=approvedProfile();withAnalytics();const writeText=jest.fn().mockResolvedValue();Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText}});
 act(()=>root.render(<PartnerPage/>));await flush();await act(async()=>Simulate.click(findButton("Copy code")));expect(writeText).toHaveBeenCalledWith("ANNA10");expect(container.textContent).toContain("Code copied.");
 await act(async()=>Simulate.click(findButton("Copy sharing text")));expect(writeText.mock.calls[1][0]).toContain("I may earn a commission");expect(writeText.mock.calls[1][0]).toContain("ANNA10");
});
test("zero analytics shows a useful empty state and settings never loads graphs",async()=>{
 profile=approvedProfile();const previous=teacherApi.getMockImplementation();teacherApi.mockImplementation(async(path,...args)=>path==="partners/me/analytics"?{...analyticsFixture(),months:analyticsFixture().months.map(m=>({...m,earnedCents:0,adjustmentCents:0,netCents:0,qualifiedPurchases:0}))}:previous(path,...args));
 act(()=>root.render(<PartnerPage/>));await flush();expect(container.textContent).toContain("No commission recorded in this period");expect(container.textContent).toContain("No qualifying purchases in this period");
 teacherApi.mockClear();act(()=>root.render(<PartnerPage settingsMode/>));await flush();expect(teacherApi.mock.calls.some(([path])=>path==="partners/me/analytics")).toBe(false);expect(container.querySelector('svg[role="img"]')).toBeNull();
});


test("partner workspace switches languages live, localizes charts and preserves partner data",async()=>{
 profile={...approvedProfile(),displayName:"Private Partner Name",contactEmail:"owner@example.com",country:"DE"};withAnalytics();
 const writeText=jest.fn().mockResolvedValue();Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText}});
 act(()=>root.render(<PartnerPage/>));await flush();
 for(const language of ["de","ar","fr","uk","tr","en"]){
  await act(async()=>{await i18n.changeLanguage(language);});await flush();
  const section=container.querySelector("section");expect(section.lang).toBe(language);expect(section.dir).toBe(language==="ar"?"rtl":"ltr");
  expect(container.querySelector("h1").textContent).toBe(tr("Your partner workspace"));
  expect(container.textContent).toContain(tr("Your discount codes"));expect(container.textContent).toContain("ANNA10");expect(container.textContent).toContain("Private Partner Name");expect(container.textContent).toContain("owner@example.com");
  expect(container.querySelector('svg[role="img"]').getAttribute('aria-label')).not.toContain("{{");
  expect(findButton(tr("Request payout")).disabled).toBe(false);
  await act(async()=>Simulate.click(findButton(tr("Copy sharing text"))));
  expect(writeText.mock.calls.at(-1)[0]).toContain(`https://smartpruefung.com/${language}/for-learners`);expect(writeText.mock.calls.at(-1)[0]).toContain("ANNA10");
  if(language!=="en")expect(writeText.mock.calls.at(-1)[0]).not.toContain("I may earn a commission");
  expect(container.textContent).toContain(new Intl.NumberFormat(language==="en"?"en-IE":language,{style:"currency",currency:"EUR"}).format(50));
 }
});
test("localized application searches countries and preserves ISO codes, platform values and email input types",async()=>{
 await i18n.changeLanguage("ar");mockSignedIn=true;act(()=>root.render(<PartnerPage/>));await flush();
 expect(container.querySelector('[name="contactEmail"]').type).toBe("email");
 change('[name="displayName"]',"Private Company");change('[name="countrySearch"]',new Intl.DisplayNames(["ar"],{type:"region"}).of("DE"));
 const option=container.querySelector('[role="option"] button');act(()=>Simulate.click(option));
 expect(container.querySelector('[name="country"]').value).toBe("DE");await submitStep();
 const other=container.querySelector('option[value="Other"]');expect(other.textContent).toBe(tr("Other"));expect(other.value).toBe("Other");
 expect(container.querySelector('option[value="Facebook"]').value).toBe("Facebook");
 expect(container.querySelector("textarea").placeholder).toBe(tr("I help German learners through…"));
 await fillAudience();change('[name="holder"]',"Private Company");change('[name="paypalEmail"]',"payout@example.com");
 act(()=>Simulate.change(container.querySelector('input[type="checkbox"]'),{target:{checked:true}}));await submitStep();
 const payload=teacherApi.mock.calls.find(([path,method])=>path==="partners/apply"&&method==="POST")[2];
 expect(payload.country).toBe("DE");expect(payload.contactEmail).toBe("registered@example.com");expect(payload.payout.method).toBe("PAYPAL");expect(payload.payout.paypalEmail).toBe("payout@example.com");expect(payload.socials[0].platform).toBe("Instagram");
});
test("all partner phrases have complete translations and preserve interpolation placeholders",()=>{
 const required=["Your partner workspace","Create your partner account","Partner terms and privacy notice · 24 November 2026","Give learners {{discount}}% off. Earn {{commission}}% commission on qualifying purchases.","Partner applications are temporarily unavailable. Please try again later."];
 for(const key of required)for(const lang of ["de","ar","fr","uk","tr"]){expect(featureCatalog[key][lang]).toBeTruthy();expect(featureCatalog[key][lang]).not.toBe(key);}
 for(const [key,values] of Object.entries(featureCatalog))for(const lang of ["de","ar","fr","uk","tr"]){expect(values[lang]).toBeTruthy();expect([...(values[lang].matchAll(/\{\{(\w+)\}\}/g))].map(m=>m[1]).sort()).toEqual([...(key.matchAll(/\{\{(\w+)\}\}/g))].map(m=>m[1]).sort());}
 expect(tr("Check display name.")).toBe("Check display name.");
});
