 ▐▛███▜▌   Claude Code v2.1.181
▝▜█████▛▘  Sonnet 4.6 · API Usage Billing
  ▘▘ ▝▝    ~/museum-activities/museum-activities


❯ /clear                                                                        

❯ Extract components we can reuse. Like the tags, buttons, ... Abstract all     
  components we have used similar versions of.                                  

  Thought for 15s (ctrl+o to expand)

⏺ Skill(superpowers:brainstorming)
  ⎿  Successfully loaded skill

  Thought for 10s (ctrl+o to expand)

⏺ Let me explore the codebase to understand what's been built so far.

  Thought for 23s, searched for 2 patterns, read 9 files (ctrl+o to expand)

⏺ I can see the duplications clearly. Before proposing an approach — are you
  thinking of a flat components/ui/ folder for generic primitives, or would you
  prefer a more structured components/ui/Button/, components/ui/Badge/
  folder-per-component layout (matching the style of your existing feature
  components)?

✻ Sautéed for 1m 51s

❯ components/ui for primitibes                                                  

  Thought for 14s (ctrl+o to expand)
⏺ Here's what I found that's duplicated across components:

  ┌───────────────────────────┬─────────────────────────────────────────────┐
  │          Pattern          │                    Where                    │
  ├───────────────────────────┼─────────────────────────────────────────────┤
  │ .badge + .badge--{type}   │ ActivityCard.module.css +                   │
  │ CSS                       │ BookingModal.module.css — identical         │
  ├───────────────────────────┼─────────────────────────────────────────────┤
  │ TYPE_LABELS constant      │ ActivityCard.tsx + BookingModal.tsx —       │
  │                           │ identical                                   │
  ├───────────────────────────┼─────────────────────────────────────────────┤
  │ Primary button (filled    │ bookButton, submitButton, primaryButton —   │
  │ accent, pill)             │ same styles 3×                              │
  ├───────────────────────────┼─────────────────────────────────────────────┤
  │ Secondary button          │ secondaryButton in modal                    │
  │ (outlined, pill)          │                                             │
  ├───────────────────────────┼─────────────────────────────────────────────┤
  │ Icon button (square,      │ closeButton in modal                        │
  │ transparent)              │                                             │
  ├───────────────────────────┼─────────────────────────────────────────────┤
  │ Location pin SVG + text   │ ActivityCard + BookingModal — identical     │
  │                           │ markup                                      │
  └───────────────────────────┴─────────────────────────────────────────────┘

  Three approaches for what to extract:

  A — Minimal (just the obvious wins): Extract Badge and Button
  (primary/secondary/icon). Leave LocationLabel inline and move TYPE_LABELS to a
  shared util. Clean, low churn. My recommendation.

  B — Full primitives: Same as A, plus LocationLabel as its own component. Most
  thorough; LocationLabel is small but the SVG duplication is real.

  C — Full + extract TypeFilter pill: Everything in B, plus TogglePill from
  TypeFilter. That pill has different UX semantics (toggle state, neutral
  colors) so it feels more like a separate pattern than a true Button variant.

  I'd go with A — it removes all meaningful duplication without extracting
  things so small they add more import noise than they save. LocationLabel is
  borderline; easy to add later.

  Which approach do you want to go with?

✻ Churned for 22s

❯ A but put the locationlabel icon in its own icons folder. Also check if we    
  have common css styling we can move to the global folder.                     

  Thought for 16s (ctrl+o to expand)

⏺ Let me check all SVGs and CSS patterns before presenting the full design.

  Thought for 12s, searched for 2 patterns (ctrl+o to expand)

⏺ Good findings. Two SVG icons are duplicated — LocationPinIcon (used in both
  ActivityCard and BookingModal) and CloseIcon (BookingModal only, but a clear
  icon primitive). And there's one CSS pattern worth globalizing: focus-visible
  outline is written identically (outline: 2px solid var(--color-accent); 
  outline-offset: 2px) on every interactive element across all three CSS modules
  — that can become a single global rule.

  Here's the full design:

  ---
  New files in components/ui/:

  - icons/LocationPinIcon.tsx — the location pin SVG, props: width?, height?
  - icons/CloseIcon.tsx — the X SVG, props: width?, height?
  - Badge.tsx + Badge.module.css — activity type badge; absorbs TYPE_LABELS and
  the .badge + .badge--{type} CSS duplicated in ActivityCard and BookingModal
  - Button.tsx + Button.module.css — three variants via a variant prop: primary
  (filled accent), secondary (outlined), icon (transparent square for close);
  extends <button> props

  Shared constant:

  - TYPE_LABELS moves from both component files into constants/activity.ts (or
  utils/activity.ts if that file exists). Badge imports from there; so does
  anything else that needs it.

  CSS globals:

  - Add a global :focus-visible rule to globals.css — removes the per-element
  :focus-visible blocks from all three CSS modules

  Consumers updated:

  - ActivityCard — replace inline badge markup with <Badge>, inline SVG with
  <LocationPinIcon>, button with <Button variant="primary">
  - BookingModal — replace all buttons with <Button> variants, both SVGs with
  icon components, both badge usages with <Badge>
  - TYPE_LABELS removed from both files

  Does this look right to you?

✻ Cogitated for 40s

❯ Implement                                                                     

  Thought for 2m 18s, searched for 1 pattern, read 2 files (ctrl+o to expand)

⏺ Clear picture. Let me implement everything now.

⏺ Write(components/ui/icons/LocationPinIcon.tsx)
  ⎿  Wrote 21 lines to components/ui/icons/LocationPinIcon.tsx
       2   width?: number;nPinIconProps {
       3   height?: number;
       4 }
       5 
       6 export default function LocationPinIcon({ width = 14, height = 1
         4 }: LocationPinIconProps) {
       7   return (
       8     <svg
       9       width={width}
      10       height={height}
     … +13 lines (ctrl+o to expand)

⏺ Write(components/ui/icons/CloseIcon.tsx)
  ⎿  Wrote 20 lines to components/ui/icons/CloseIcon.tsx
       2   width?: number;onProps {
       3   height?: number;
       4 }
       5 
       6 export default function CloseIcon({ width = 20, height = 20 }: C
         loseIconProps) {
       7   return (
       8     <svg
       9       width={width}
      10       height={height}
     … +11 lines (ctrl+o to expand)

⏺ Write(components/ui/Badge.tsx)
  ⎿  Wrote 15 lines to components/ui/Badge.tsx
       1 import type { ActivityType } from "@/types/activity";
       2 import { TYPE_LABELS } from "@/utils/activities";
       3 import styles from "./Badge.module.css";
       4 
       5 interface BadgeProps {
       6   type: ActivityType;
       7 }
       8 
       9 export default function Badge({ type }: BadgeProps) {
      10   return (
     … +5 lines (ctrl+o to expand)

⏺ Write(components/ui/Badge.module.css)
  ⎿  Wrote 16 lines to components/ui/Badge.module.css
       1 .badge {
       2   display: inline-block;
       3   padding: 2px var(--space-3);
       4   border-radius: var(--radius-full);
       5   font-size: var(--text-xs);
       6   font-weight: 600;
       7   letter-spacing: 0.03em;
       8   text-transform: uppercase;
       9   color: #fff;
      10   line-height: 1.6;
     … +7 lines (ctrl+o to expand)

⏺ Write(components/ui/Button.tsx)
  ⎿  Wrote 17 lines to components/ui/Button.tsx
       2 import styles from "./Button.module.css"; "react";
       3 
       4 type ButtonVariant = "primary" | "secondary" | "icon";
       5 
       6 interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonEle
       7   variant?: ButtonVariant;
       8 }
       9 
      10 export default function Button({ variant = "primary", className,
          children, ...props }: ButtonProps) {
     … +10 lines (ctrl+o to expand)

⏺ Write(components/ui/Button.module.css)
  ⎿  Wrote 61 lines to components/ui/Button.module.css
       1 .button {
       2   border: none;
       3   font: inherit;
       4   cursor: pointer;
       5 }
       6 
       7 /* ── Primary ── */
       8 .primary {
       9   padding: var(--space-3) var(--space-6);
      10   border-radius: var(--radius-full);
     … +51 lines (ctrl+o to expand)

⏺ Now add TYPE_LABELS to utils/activities.ts and update globals.css:

⏺ Update(utils/activities.ts)
  ⎿  Added 8 lines, removed 1 line
       1 -import type { Activity } from "@/types/activity";              
       1 +import type { Activity, ActivityType } from "@/types/activity";
       2  import { formatDutchDate } from "@/utils/date";
       3  
       4 +export const TYPE_LABELS: Record<ActivityType, string> = {     
       5 +  rondleiding: "Rondleiding",                                  
       6 +  workshop: "Workshop",                                        
       7 +  lezing: "Lezing",                                            
       8 +  kinderprogramma: "Kinderprogramma",                          
       9 +};                                                             
      10 +                                                               
      11  export type AvailabilityState = "available" | "almost-full" | "
          sold-out";
      12  
      13  const ALMOST_FULL_THRESHOLD = 3;

⏺ Update(app/globals.css)
  ⎿  Added 5 lines
      87    cursor: pointer;
      88  }
      89  
      90 +button:focus-visible {                                         
      91 +  outline: 2px solid var(--color-accent);                      
      92 +  outline-offset: 2px;                                         
      93 +}                                                              
      94 +                                                               
      95  /* ─── Utility ────────────────────────────────────────────────
          ─ */
      96  .sr-only {
      97    position: absolute;

⏺ Now update ActivityCard.tsx and its CSS:

⏺ Write(components/ActivityCard/ActivityCard.tsx)
  ⎿  Added 8 lines, removed 27 lines
       1  import type { Activity } from "@/types/activity";
       2  import { getAvailability } from "@/utils/activities";
       3 +import Badge from "@/components/ui/Badge";                     
       4 +import Button from "@/components/ui/Button";                   
       5 +import LocationPinIcon from "@/components/ui/icons/LocationPinI
         +con";                                                          
       6  import styles from "./ActivityCard.module.css";
       7  
       5 -const TYPE_LABELS: Record<Activity["type"], string> = {        
       6 -  rondleiding: "Rondleiding",                                  
       7 -  workshop: "Workshop",                                        
       8 -  lezing: "Lezing",                                            
       9 -  kinderprogramma: "Kinderprogramma",                          
      10 -};                                                             
      11 -                                                               
       8  interface ActivityCardProps {
       9    activity: Activity;
      10    onBook: (activity: Activity) => void;
     ...
      40      >
      41        <div className={styles.body}>
      42          <div className={styles.meta}>
      47 -          <span                                                
      48 -            className={`${styles.badge} ${styles[`badge--${acti
         -vity.type}`]}`}                                                
      49 -          >                                                    
      50 -            {TYPE_LABELS[activity.type]}                       
      51 -          </span>                                              
      43 +          <Badge type={activity.type} />                       
      44            <time className={styles.time}>
      45              {activity.startTime} – {activity.endTime}
      46            </time>
     ...
      55          <div className={styles.footer}>
      56            <div className={styles.footerMeta}>
      57              <span className={styles.location}>
      66 -              <svg                                             
      67 -                width="14"                                     
      68 -                height="14"                                    
      69 -                viewBox="0 0 24 24"                            
      70 -                fill="none"                                    
      71 -                stroke="currentColor"                          
      72 -                strokeWidth="2"                                
      73 -                aria-hidden="true"                             
      74 -              >                                                
      75 -                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 
         -13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />                          
      76 -                <circle cx="12" cy="9" r="2.5" />              
      77 -              </svg>                                           
      58 +              <LocationPinIcon />                              
      59                {activity.location}
      60              </span>
      61              {renderAvailability()}
      62            </div>
      63  
      83 -          <button                                              
      84 -            type="button"                                      
      64 +          <Button                                              
      65 +            variant="primary"                                  
      66              className={styles.bookButton}
      67              onClick={() => onBook(activity)}
      68              disabled={isSoldOut}
      69              aria-disabled={isSoldOut}
      70            >
      71              {isSoldOut ? "Vol" : "Reserveer"}
      91 -          </button>                                            
      72 +          </Button>                                            
      73          </div>
      74        </div>
      75      </article>

⏺ Write(components/ActivityCard/ActivityCard.module.css)
  ⎿  Added 2 lines, removed 49 lines
      38    gap: var(--space-3);
      39  }
      40  
      41 -.badge {                                                       
      42 -  display: inline-block;                                       
      43 -  padding: 2px var(--space-3);                                 
      44 -  border-radius: var(--radius-full);                           
      45 -  font-size: var(--text-xs);                                   
      46 -  font-weight: 600;                                            
      47 -  letter-spacing: 0.03em;                                      
      48 -  text-transform: uppercase;                                   
      49 -  color: #fff;                                                 
      50 -  line-height: 1.6;                                            
      51 -}                                                              
      52 -                                                               
      53 -.badge--rondleiding {                                          
      54 -  background: var(--badge-rondleiding);                        
      55 -}                                                              
      56 -.badge--workshop {                                             
      57 -  background: var(--badge-workshop);                           
      58 -}                                                              
      59 -.badge--lezing {                                               
      60 -  background: var(--badge-lezing);                             
      61 -}                                                              
      62 -.badge--kinderprogramma {                                      
      63 -  background: var(--badge-kinderprogramma);                    
      64 -}                                                              
      65 -                                                               
      41  .time {
      42    font-size: var(--text-sm);
      43    color: var(--color-text-muted);
     ...
      102    color: var(--color-accent);
      103  }
      104  
      130 -/* ── Book button ── */                                       
      105 +/* ── Book button (layout override) ── */                     
      106  .bookButton {
      132 -  padding: var(--space-2) var(--space-5);                     
      133 -  border-radius: var(--radius-full);                          
      134 -  border: none;                                               
      135 -  background: var(--color-accent);                            
      136 -  color: #fff;                                                
      137 -  font-size: var(--text-sm);                                  
      138 -  font-weight: 600;                                           
      139 -  white-space: nowrap;                                        
      140 -  transition: background 150ms ease;                          
      107    flex-shrink: 0;
      108 +  padding: var(--space-2) var(--space-5);                     
      109  }
      143 -                                                              
      144 -.bookButton:hover:not(:disabled) {                            
      145 -  background: var(--color-accent-hover);                      
      146 -}                                                             
      147 -                                                              
      148 -.bookButton:focus-visible {                                   
      149 -  outline: 2px solid var(--color-accent);                     
      150 -  outline-offset: 2px;                                        
      151 -}                                                             
      152 -                                                              
      153 -.bookButton:disabled {                                        
      154 -  background: #c4bdb6;                                        
      155 -  cursor: not-allowed;                                        
      156 -}                                                             
⏺ Now update BookingModal.tsx:

⏺ Write(components/BookingModal/BookingModal.tsx)
  ⎿  Added 16 lines, removed 56 lines
       6  import { capitalise } from "@/utils/string";
       7  import { formatDutchDate } from "@/utils/date";
       8  import { isValidEmail } from "@/utils/validation";
       9 +import Badge from "@/components/ui/Badge";                     
      10 +import Button from "@/components/ui/Button";                   
      11 +import CloseIcon from "@/components/ui/icons/CloseIcon";       
      12 +import LocationPinIcon from "@/components/ui/icons/LocationPinI
         +con";                                                          
      13  import styles from "./BookingModal.module.css";
      14  
      11 -const TYPE_LABELS: Record<Activity["type"], string> = {        
      12 -  rondleiding: "Rondleiding",                                  
      13 -  workshop: "Workshop",                                        
      14 -  lezing: "Lezing",                                            
      15 -  kinderprogramma: "Kinderprogramma",                          
      16 -};                                                             
      17 -                                                               
      15  export type BookingDetails = {
      16    activity: Activity;
      17    name: string;
     ...
      47    const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
      48    const triggerRef = useRef<Element | null>(null);
      49  
      53 -  // Remember what had focus before opening so we can restore i
         -t on close                                                     
      50    useEffect(() => {
      51      triggerRef.current = document.activeElement;
      52      dialogRef.current?.focus();
      53    }, []);
      54  
      59 -  // Move focus to confirmation heading after step change      
      55    useEffect(() => {
      56      if (step === "confirmed") {
      57        confirmHeadingRef.current?.focus();
      58      }
      59    }, [step]);
      60  
      66 -  // Close on Escape                                           
      61    useEffect(() => {
      62      function handleKeyDown(e: KeyboardEvent) {
      63        if (e.key === "Escape") handleClose();
     ...
      66      return () => document.removeEventListener("keydown", handle
          KeyDown);
      67    }, []);
      68  
      75 -  // Lock body scroll while open                               
      69    useEffect(() => {
      70      document.body.style.overflow = "hidden";
      71      return () => {
     ...
      122          tabIndex={-1}
      123        >
      124          {/* ── Close button ── */}
      132 -        <button                                               
      133 -          type="button"                                       
      125 +        <Button                                               
      126 +          variant="icon"                                      
      127            className={styles.closeButton}
      128            onClick={handleClose}
      129            aria-label="Sluit venster"
      130          >
      138 -          <svg                                                
      139 -            width="20"                                        
      140 -            height="20"                                       
      141 -            viewBox="0 0 24 24"                               
      142 -            fill="none"                                       
      143 -            stroke="currentColor"                             
      144 -            strokeWidth="2"                                   
      145 -            aria-hidden="true"                                
      146 -          >                                                   
      147 -            <path d="M18 6 6 18M6 6l12 12" />                 
      148 -          </svg>                                              
      149 -        </button>                                             
      131 +          <CloseIcon />                                       
      132 +        </Button>                                             
      133  
      134          {step === "form" ? (
      135            <>
      136              {/* ── Activity detail ── */}
      137              <div className={styles.detail}>
      138                <div className={styles.detailMeta}>
      156 -                <span                                         
      157 -                  className={`${styles.badge} ${styles[`badge-
          --${activity.type}`]}`}                                        
      158 -                >                                             
      159 -                  {TYPE_LABELS[activity.type]}                
      160 -                </span>                                       
      139 +                <Badge type={activity.type} />                
      140                  <span className={styles.detailDate}>
      141                    {dateLabel} · {activity.startTime} – {activi
           ty.endTime}
      142                  </span>
     ...
      147                </h2>
      148  
      149                <p className={styles.detailLocation}>
      171 -                <svg                                          
      172 -                  width="13"                                  
      173 -                  height="13"                                 
      174 -                  viewBox="0 0 24 24"                         
      175 -                  fill="none"                                 
      176 -                  stroke="currentColor"                       
      177 -                  strokeWidth="2"                             
      178 -                  aria-hidden="true"                          
      179 -                >                                             
      180 -                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13
          - 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />                      
      181 -                  <circle cx="12" cy="9" r="2.5" />           
      182 -                </svg>                                        
      150 +                <LocationPinIcon width={13} height={13} />    
      151                  {activity.location}
      152                </p>
      153  
     ...
      253                  )}
      254                </div>
      255  
      288 -              <button type="submit" className={styles.submitBu
          -tton}>                                                        
      256 +              <Button type="submit" className={styles.submitBu
          +tton}>                                                        
      257                  Bevestig reservering
      290 -              </button>                                       
      258 +              </Button>                                       
      259  
      260                <p className={styles.disclaimer}>
      261                  Je ontvangt een bevestiging per e-mail. Gratis
            annuleren tot 24
     ...
      300              )}
      301  
      302              <div className={styles.confirmationActions}>
      335 -              <button                                         
      336 -                type="button"                                 
      337 -                className={styles.secondaryButton}            
      338 -                onClick={handleClose}                         
      339 -              >                                               
      303 +              <Button variant="secondary" onClick={handleClose
          +}>                                                            
      304                  Terug naar overzicht
      341 -              </button>                                       
      342 -              <button                                         
      343 -                type="button"                                 
      344 -                className={styles.primaryButton}              
      345 -                onClick={handleClose}                         
      346 -              >                                               
      305 +              </Button>                                       
      306 +              <Button variant="primary" onClick={handleClose}>
      307                  Nog een activiteit
      348 -              </button>                                       
      308 +              </Button>                                       
      309              </div>
      310            </div>
      311          )}

⏺ Now strip the duplicated styles from BookingModal.module.css:

⏺ Write(components/BookingModal/BookingModal.module.css)
  ⎿  Added 5 lines, removed 115 lines
      12  }
      13  
      14  @keyframes fadeIn {
      15 -  from {                                                       
      16 -    opacity: 0;                                                
      17 -  }                                                            
      18 -  to {                                                         
      19 -    opacity: 1;                                                
      20 -  }                                                            
      15 +  from { opacity: 0; }                                         
      16 +  to   { opacity: 1; }                                         
      17  }
      18  
      19  /* ── Panel ── */
     ...
      54    }
      55  }
      56  
      61 -/* ── Close button ── */                                       
      57 +/* ── Close button (positioning only) ── */                    
      58  .closeButton {
      59    position: absolute;
      60    top: var(--space-4);
      61    right: var(--space-4);
      66 -  display: flex;                                               
      67 -  align-items: center;                                         
      68 -  justify-content: center;                                     
      69 -  width: 32px;                                                 
      70 -  height: 32px;                                                
      71 -  border-radius: var(--radius-full);                           
      72 -  border: none;                                                
      73 -  background: transparent;                                     
      74 -  color: var(--color-text-muted);                              
      75 -  transition:                                                  
      76 -    background 150ms ease,                                     
      77 -    color 150ms ease;                                          
      62  }
      63  
      80 -.closeButton:hover {                                           
      81 -  background: var(--color-border);                             
      82 -  color: var(--color-text);                                    
      83 -}                                                              
      84 -                                                               
      85 -.closeButton:focus-visible {                                   
      86 -  outline: 2px solid var(--color-accent);                      
      87 -  outline-offset: 2px;                                         
      88 -}                                                              
      89 -                                                               
      64  /* ── Activity detail ── */
      65  .detail {
      66    padding: var(--space-6) var(--space-6) var(--space-5);
     ...
       75    align-items: center;
       76    gap: var(--space-3);
       77    flex-wrap: wrap;
      104 -  padding-right: var(--space-8); /* clear close button */     
       78 +  padding-right: var(--space-8);                              
       79  }
       80  
      107 -.badge {                                                      
      108 -  display: inline-block;                                      
      109 -  padding: 2px var(--space-3);                                
      110 -  border-radius: var(--radius-full);                          
      111 -  font-size: var(--text-xs);                                  
      112 -  font-weight: 600;                                           
      113 -  letter-spacing: 0.03em;                                     
      114 -  text-transform: uppercase;                                  
      115 -  color: #fff;                                                
      116 -  line-height: 1.6;                                           
      117 -}                                                             
      118 -                                                              
      119 -.badge--rondleiding {                                         
      120 -  background: var(--badge-rondleiding);                       
      121 -}                                                             
      122 -.badge--workshop {                                            
      123 -  background: var(--badge-workshop);                          
      124 -}                                                             
      125 -.badge--lezing {                                              
      126 -  background: var(--badge-lezing);                            
      127 -}                                                             
      128 -.badge--kinderprogramma {                                     
      129 -  background: var(--badge-kinderprogramma);                   
      130 -}                                                             
      131 -                                                              
       81  .detailDate {
       82    font-size: var(--text-sm);
       83    color: var(--color-text-muted);
     ...
      185    font-weight: 500;
      186  }
      187  
      188 +/* ── Submit button (layout override) ── */                   
      189  .submitButton {
      240 -  padding: var(--space-3) var(--space-6);                     
      241 -  border-radius: var(--radius-full);                          
      242 -  border: none;                                               
      243 -  background: var(--color-accent);                            
      244 -  color: #fff;                                                
      245 -  font-size: var(--text-base);                                
      246 -  font-weight: 600;                                           
      247 -  transition: background 150ms ease;                          
      190    align-self: flex-start;
      191  }
      192  
      251 -.submitButton:hover {                                         
      252 -  background: var(--color-accent-hover);                      
      253 -}                                                             
      254 -                                                              
      255 -.submitButton:focus-visible {                                 
      256 -  outline: 2px solid var(--color-accent);                     
      257 -  outline-offset: 2px;                                        
      258 -}                                                             
      259 -                                                              
      193  .disclaimer {
      194    font-size: var(--text-xs);
      195    color: var(--color-text-muted);
     ...
      254    flex-wrap: wrap;
      255    justify-content: center;
      256  }
      324 -                                                              
      325 -.primaryButton {                                              
      326 -  padding: var(--space-3) var(--space-6);                     
      327 -  border-radius: var(--radius-full);                          
      328 -  border: none;                                               
      329 -  background: var(--color-accent);                            
      330 -  color: #fff;                                                
      331 -  font-size: var(--text-sm);                                  
      332 -  font-weight: 600;                                           
      333 -  transition: background 150ms ease;                          
      334 -}                                                             
      335 -                                                              
      336 -.primaryButton:hover {                                        
      337 -  background: var(--color-accent-hover);                      
      338 -}                                                             
      339 -                                                              
      340 -.primaryButton:focus-visible {                                
      341 -  outline: 2px solid var(--color-accent);                     
      342 -  outline-offset: 2px;                                        
      343 -}                                                             
      344 -                                                              
      345 -.secondaryButton {                                            
      346 -  padding: var(--space-3) var(--space-6);                     
      347 -  border-radius: var(--radius-full);                          
      348 -  border: 1.5px solid var(--color-border);                    
      349 -  background: transparent;                                    
      350 -  color: var(--color-text);                                   
      351 -  font-size: var(--text-sm);                                  
      352 -  font-weight: 600;                                           
      353 -  transition:                                                 
      354 -    border-color 150ms ease,                                  
      355 -    background 150ms ease;                                    
      356 -}                                                             
      357 -                                                              
      358 -.secondaryButton:hover {                                      
      359 -  border-color: var(--color-text);                            
      360 -  background: var(--color-bg);                                
      361 -}                                                             
      362 -                                                              
      363 -.secondaryButton:focus-visible {                              
      364 -  outline: 2px solid var(--color-accent);                     
      365 -  outline-offset: 2px;                                        
      366 -}                                                             

⏺ Remove the now-redundant :focus-visible block from TypeFilter.module.css:

⏺ Update(components/TypeFilter/TypeFilter.module.css)
  ⎿  Removed 5 lines
      39    color: var(--color-text);
      40  }
      41  
      42 -.pill:focus-visible {                                          
      43 -  outline: 2px solid var(--color-accent);                      
      44 -  outline-offset: 2px;                                         
      45 -}                                                              
      46 -                                                               
      42  /* active state */
      43  .pill[aria-pressed="true"] {
      44    background: var(--color-text);

⏺ Now let's verify it builds cleanly:

⏺ Bash(cd /Users/Sander\ Vandamme/museum-activities/museum-activities && npm run
      build 2>&1)
  ⎿  > museum-activities@0.1.0 build
     > next build
     … +20 lines (ctrl+o to expand)

⏺ Clean build. Here's a summary of what was done:

  New components/ui/ primitives:
  - Badge.tsx / Badge.module.css — activity type badge with labels; consumed
  from utils/activities.ts
  - Button.tsx / Button.module.css — three variants (primary, secondary, icon);
  extendable via className for layout overrides
  - icons/LocationPinIcon.tsx — location pin SVG
  - icons/CloseIcon.tsx — X SVG

  Shared constant:
  - TYPE_LABELS moved to utils/activities.ts; removed from both ActivityCard and
  BookingModal

  CSS globals:
  - Global button:focus-visible rule in globals.css — removed per-button focus
  blocks from all three CSS modules

  Module CSS after extraction:
  - ActivityCard.module.css — kept only layout/card-specific styles; .bookButton
  now just has flex-shrink: 0 + compact padding override
  - BookingModal.module.css — stripped badge, button visual styles; .closeButton
  now only positions; .submitButton only sets align-self: flex-start
  - TypeFilter.module.css — removed now-redundant :focus-visible block

✻ Churned for 4m 17s