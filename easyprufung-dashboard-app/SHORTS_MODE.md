# Recording short exam videos

Enable **Shorts mode** on the login page before signing in with email or Google.
The choice is saved in this browser and also applies to guest exams.

When an exam, result or exercise review opens, the page uses a centred 9:16
recording canvas. Crop your screen recorder to the white canvas and black brand
bar. The surrounding background is also white.

- The top 21% remains blank for text added in your video editor.
- The bottom 8% displays **SmartPrüfung** and remains visible while scrolling.
- The exam header reads **TELC. Deutsch B1**.
- The original digital exam exercises and controls remain in use: dropdowns,
  inline gaps, the word bank, listening tables and the writing editor.
- Reading text and its questions occupy independently scrollable panels so both
  stay on screen. Advertisements and situations use the same arrangement. The
  language-element text stays above its original word bank.
- Paper mode keeps the original booklet pages and separate answer sheet in one
  scrollable page. Scroll down to bring the Antwortbogen into the full recording
  area between the margins.
- In **Sprachbausteine Teil 1 and Teil 2**, scroll the original booklet and then
  down to **Antwortbogen**. Click a numbered gap to preview its answer possibilities just below it.
  Click the gap again or use the close button to hide the overlay. The gap
  selector and show/hide toolbar have been removed. Filled answers appear
  black and bold within the paragraph. Click a choice in the overlay to fill the gap and mark the same answer
  on the original answer sheet below. Editing or clearing the answer sheet updates
  the gap as well. Selection closes the overlay; reopening it lets you change the
  answer. Read-only review cannot change answers. Outside Shorts mode the original
  static option lists remain unchanged. In Shorts mode the original numbered a/b/c
  lists and boxed word bank are also retained below the passage; the optional
  overlay uses the same answer styling, without a visible gap heading. Teil 2
  answer words and their letter labels are uppercase.
- Writing keeps the original task prompt followed by the lined response sheet.
- There are no replacement quiz cards or per-question navigation. All questions
  remain in their original exam part. Scroll each panel to record a question.
- Exit with **Escape** or **Exit Shorts mode** outside the canvas. On narrow
  screens, the exit button appears on hover or keyboard focus to keep the blank
  caption area clean. You can also uncheck the option on the login page.

The preference changes presentation only. Exam questions, answer persistence,
listening behaviour, the real countdown, access rules and submission remain in
use. Long tasks still require scrolling; text is not shrunk to fit an entire exam
part into one frame.

## Validation

Run `npm run test:shorts`, `npm run test:paper`,
`npm run test:guest-checkpoint`, and `npm run build`.

The Shorts checks cover the recording frame, browser preference, interactive
answers across all nine parts in both formats, writing input, original exam
renderers, scroll reset, exit and background focus isolation. Existing paper
and guest checkpoint checks verify saved work and submission behaviour.

A live visual browser preview could not be completed in the editing session:
local server binding and local-file browser previews were blocked. Inspect the
layout with your actual exam content before recording.

The right-side answer reference and recording replay have been removed. The
countdown is hidden in Shorts mode; normal exam timing and the server deadline
are unchanged.

Shorts typography is enlarged for recording: main exercise text and digital
answer choices use 16px, paper word banks and overlay choices use 15px, and
writing responses use 18px. Paper answer labels are 16px, question numbers are 18px, and selection bubbles
are enlarged with more spacing. Normal mode is unchanged.

In Hörverstehen Teil 1, 2 and 3, click a statement to focus it: its text becomes
slightly larger and underlined, while the other statements blur. Click another
statement to move focus, or the same statement again to clear it. Enter/Space
works too. This applies to both paper and digital Shorts layouts; answer
controls and audio stay usable. Focus resets when changing parts.

Paper exercises now scroll as one page. Scroll down until **Antwortbogen**
reaches the top of the recording area; the sheet is at least as tall as the
space between the blank top margin and the bottom brand. Long answer sheets
continue scrolling naturally. In listening parts, the focused statement and
its answer-sheet row share focus. Click a different answer row to move focus;
other statements and rows blur without changing any selected answers.

Each booklet page also has a minimum height equal to the space between the
two recording margins, matching the Antwortbogen. The page footer stays at
the bottom. Longer pages continue scrolling without shrinking the text.
