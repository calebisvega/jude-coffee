#!/usr/bin/env python3
"""Generate Jude /services/* SEO landing pages + sitemap entries."""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from site_common import (  # noqa: E402
    BANNED_HERO_IMAGES,
    CACHE,
    HUBS,
    SERVICES,
    esc,
    mega_footer,
    reviews_section,
)

TODAY = date.today().isoformat()
OUT = ROOT / "services"
OUT.mkdir(exist_ok=True)

SERVICE_PAGES = [
    {
        "slug": "corporate-coffee-catering",
        "name": "Corporate Coffee Catering",
        "short": "Corporate Catering",
        "h1": "Corporate coffee catering in Central Florida",
        "eyebrow": "Corporate events · offices · conferences",
        "lead": "Elevate meetings, appreciation days, and brand moments with a specialty mobile espresso cart — pulled to order, ready for your team.",
        "meta": "Corporate coffee catering across Central Florida — mobile espresso for offices, conferences, and client events. Get a quote from Jude.",
        "og_title": "Corporate Coffee Catering | Jude",
        "hero_img": "/images/barista.png",
        "hero_alt": "Jude baristas with the coffee cart at a corporate event",
        "why_title": "Why companies book a mobile coffee cart",
        "why": [
            ("Boost team morale", "A real café moment shows employees you value them — more memorable than another tray of pastries."),
            ("Impress clients", "Hand guests a cortado or latte at the door and the meeting starts warmer."),
            ("Drive event engagement", "At conferences and brand days, the cart becomes a natural gathering point."),
            ("Hassle-free setup", "We bring the machine, supplies, and baristas — then pack out so hosting stays simple."),
        ],
        "body_sections": [
            (
                "Corporate coffee that fits the room",
                "Jude is based in Lakeland and travels across Tampa Bay, Orlando, and Central Florida for corporate coffee catering. Whether you are hosting an all-hands in Westshore, a client day in Winter Park, or a product launch in Lake Nona, we pull espresso on-site so guests get specialty drinks — not a carafe on a table.",
            ),
            (
                "Offices, conferences, and brand days",
                "We regularly serve employee appreciation mornings, recruiting open houses, trade-show style booths, and quarterly gatherings. Tell us the headcount and service window — we size the menu and staffing so the line keeps moving.",
            ),
            (
                "What to expect on event day",
                "We arrive early to set up quietly, dial in the espresso, and prep syrups and oat milk. During service, Jude baristas take orders, pull shots, and keep conversation easy. When the window ends, we break down and leave the space clean.",
            ),
        ],
        "types_title": "Corporate events we serve",
        "types": [
            "Employee appreciation days",
            "Client & prospect meetings",
            "Conferences & trade shows",
            "Product launches",
            "Office holiday parties",
            "Recruiting open houses",
            "Wellness weeks",
            "All-hands and town halls",
        ],
        "steps_title": "How booking corporate coffee works",
        "steps": [
            ("Share the day", "Date, venue, headcount, and what you’re gathering for."),
            ("We shape the pour", "Menu and timing sized to your agenda and rush windows."),
            ("Lock the plan", "Logistics cleared so your team can stay focused on the event."),
            ("We host", "Setup, service, and a clean pack-out while you lead the room."),
        ],
        "faqs": [
            (
                "Can you serve large corporate events?",
                "Yes. Tell us your headcount and service length — we recommend staffing so guests are not stuck in a long line. Multi-hour windows and peak rush periods are normal for corporate coffee catering.",
            ),
            (
                "Do you invoice for corporate accounting?",
                "Yes. We provide clear quotes and invoices for your team. Start with Get a quote and share any billing notes with your request.",
            ),
            (
                "Can you set up in an office lobby or conference room?",
                "Usually yes. We need a workable footprint and power for the espresso machine. We will confirm logistics once we know the venue.",
            ),
            (
                "How far in advance should we book?",
                "Two to four weeks is ideal. Peak wedding and holiday seasons fill faster — reach out early if your date is fixed.",
            ),
        ],
    },
    {
        "slug": "wedding-coffee-cart",
        "name": "Wedding Coffee Cart",
        "short": "Wedding Coffee Bar",
        "h1": "Wedding coffee cart catering in Central Florida",
        "eyebrow": "Weddings · cocktail hour · reception",
        "lead": "A specialty espresso bar for cocktail hour, dessert, or late night — so guests get a café moment instead of a forgotten coffee station.",
        "meta": "Wedding coffee cart catering in Central Florida — mobile espresso for cocktail hour, reception, and late-night. Get a quote from Jude.",
        "og_title": "Wedding Coffee Cart | Jude",
        "hero_img": "/images/popup.png",
        "hero_alt": "Jude coffee cart at a wedding celebration",
        "why_title": "Why couples book a wedding coffee cart",
        "why": [
            ("A guest favorite", "Espresso drinks become a talking point — and a softer landing after dinner or dancing."),
            ("Flexible timing", "Cocktail hour, dessert service, or late-night — we match your timeline."),
            ("Fits the venue", "Barns, hotels, backyards, and waterfront setups across Central Florida."),
            ("We handle the bar", "Machine, supplies, cups, and baristas included — you stay present with guests."),
        ],
        "body_sections": [
            (
                "Espresso for the reception that guests remember",
                "Jude brings a mobile wedding coffee cart to Lakeland, Tampa Bay, Orlando, and the Gulf Coast. Couples use us for cocktail hour energy, a dessert-course espresso moment, or a late-night pick-me-up before the last dance.",
            ),
            (
                "Menu built for celebration",
                "Espresso-based drinks, drip, and cold brew with house-made syrups. Want a signature drink named for the couple? Tell us in your quote request and we will plan it with you.",
            ),
            (
                "Day-of flow",
                "We coordinate arrival with your planner or venue, set up before guests arrive at the coffee window, and pack out cleanly so the night can keep moving.",
            ),
        ],
        "types_title": "Wedding moments we serve",
        "types": [
            "Cocktail hour coffee bar",
            "Reception espresso service",
            "Dessert-course lattes",
            "Late-night coffee cart",
            "Brunch weddings",
            "Welcome parties",
            "Rehearsal dinners",
            "Day-after brunch",
        ],
        "steps_title": "How booking a wedding coffee cart works",
        "steps": [
            ("Share the day", "Date, venue, guest count, and when coffee belongs on the timeline."),
            ("We shape the pour", "Menu and staffing sized to guest flow and the feel of the celebration."),
            ("Lock it with your planner", "Timing, placement, and power — nothing left fuzzy."),
            ("We host the moment", "Early arrival, warm service, clean pack-out while you stay present."),
        ],
        "faqs": [
            (
                "When during the wedding should we schedule the coffee cart?",
                "Cocktail hour, post-dinner dessert, and late night are the most popular. We will help you pick a window that fits your timeline and guest flow.",
            ),
            (
                "Can you work with our venue and planner?",
                "Yes. Share venue rules and load-in details when you request a quote — we coordinate arrival and power needs ahead of time.",
            ),
            (
                "Do you offer a signature wedding drink?",
                "Often yes. Tell us the flavor direction and we will suggest a drink that fits espresso, drip, or cold brew service.",
            ),
            (
                "How many guests can you serve?",
                "We size service to your headcount and window. Share your guest count for a clear recommendation.",
            ),
        ],
    },
    {
        "slug": "private-parties",
        "name": "Private Party Coffee Cart",
        "short": "Private Parties",
        "h1": "Private party coffee cart catering",
        "eyebrow": "Birthdays · showers · anniversaries",
        "lead": "Bring a specialty espresso cart to backyard celebrations, milestone parties, and gatherings at home or a private venue.",
        "meta": "Private party coffee cart catering in Central Florida — birthdays, showers, and celebrations with mobile espresso from Jude.",
        "og_title": "Private Party Coffee Cart | Jude",
        "hero_img": "/images/team.png",
        "hero_alt": "Guests gathering near the Jude coffee cart at a private event",
        "why_title": "Why hosts book Jude for private parties",
        "why": [
            ("Feels special", "Guests order real drinks — a warmer centerpiece than a static beverage table."),
            ("Works at home or a venue", "Backyards, clubhouses, barns, and private dining rooms."),
            ("Easy on the host", "We run the cart so you can stay in the conversation."),
            ("Flexible menus", "Espresso, drip, cold brew, and house syrups for mixed crowds."),
        ],
        "body_sections": [
            (
                "Coffee catering for celebrations that stay intimate",
                "From birthday brunches in Hyde Park to anniversary dinners in Winter Haven, Jude brings private party coffee cart catering across Central Florida. The cart becomes the gathering point — guests order, chat, and linger.",
            ),
            (
                "Sized for your guest list",
                "Small showers and larger milestone parties both work. Share headcount and timing so we can recommend a service window that feels generous without overrunning the night.",
            ),
        ],
        "types_title": "Private parties we serve",
        "types": [
            "Birthday parties",
            "Bridal & baby showers",
            "Anniversaries",
            "Graduation gatherings",
            "Engagement parties",
            "Family reunions",
            "Garden parties",
            "Holiday open houses",
        ],
        "steps_title": "How booking a private party cart works",
        "steps": [
            ("Share the celebration", "Date, place, guest count, and the vibe you’re after."),
            ("We send a clear quote", "Pricing for your window — no surprise add-ons midstream."),
            ("Lock the logistics", "We handle load-in details so you can keep hosting."),
            ("We pour for the room", "Warm service from first guest to clean pack-out."),
        ],
        "faqs": [
            (
                "Can you set up in a backyard?",
                "Often yes, as long as we have a safe footprint and power. Share photos or a venue note with your quote request.",
            ),
            (
                "Is there a minimum guest count?",
                "Every event is custom-quoted. Smaller gatherings are welcome — tell us the details and we will let you know what works.",
            ),
            (
                "Do you serve non-coffee drinkers?",
                "We can include options beyond espresso — ask about drip, cold brew, and house syrups for your crowd.",
            ),
        ],
    },
    {
        "slug": "holiday-parties",
        "name": "Holiday Party Coffee Cart",
        "short": "Holiday Parties",
        "h1": "Holiday party coffee catering",
        "eyebrow": "Company parties · seasonal celebrations",
        "lead": "Seasonal espresso for company holiday parties and end-of-year celebrations across Central Florida.",
        "meta": "Holiday party coffee catering in Central Florida — seasonal espresso for company parties and celebrations. Get a quote from Jude.",
        "og_title": "Holiday Party Coffee Cart | Jude",
        "hero_img": "/images/geo-close.jpg",
        "hero_alt": "Jude coffee cart set up for a celebration",
        "why_title": "Why holiday parties book a coffee cart",
        "why": [
            ("Seasonal energy", "Warm drinks that fit winter parties and festive menus."),
            ("Works with catering", "Coffee pairs with dessert or after-dinner service."),
            ("Corporate-ready", "Clear quotes and reliable timing for company events."),
            ("Guest flow", "A natural break in the evening that keeps people mingling."),
        ],
        "body_sections": [
            (
                "Espresso for the holiday calendar",
                "Jude serves holiday party coffee catering for offices, associations, and private hosts across Lakeland, Tampa Bay, and Orlando. Peak dates book early — especially December Fridays and Saturdays.",
            ),
            (
                "Seasonal menu notes",
                "Ask about house syrups and seasonal drink ideas when you request a quote. We keep service efficient so guests can get back to the party.",
            ),
        ],
        "types_title": "Holiday events we serve",
        "types": [
            "Company holiday parties",
            "Client appreciation nights",
            "End-of-year celebrations",
            "Nonprofit galas",
            "Neighborhood open houses",
            "Winter showers",
            "New Year gatherings",
            "Seasonal brand events",
        ],
        "steps_title": "How booking holiday coffee works",
        "steps": [
            ("Reach out early", "Holiday weekends fill — we’ll hold a thoughtful slot."),
            ("Align the timing", "Dinner, speeches, dessert — coffee lands where it belongs."),
            ("We arrive ready", "Setup before guests find the bar."),
            ("You close the night", "We pack out clean so the party ends soft."),
        ],
        "faqs": [
            (
                "When should we book a holiday coffee cart?",
                "As soon as your date is firm. November and December weekends go first.",
            ),
            (
                "Can you serve after dinner?",
                "Yes — dessert and post-program windows are popular for holiday parties.",
            ),
            (
                "Do you travel for holiday events outside Lakeland?",
                "Yes. We regularly serve Tampa Bay, Orlando, and surrounding Central Florida hubs.",
            ),
        ],
    },
    {
        "slug": "brand-activations",
        "name": "Brand Activation Coffee Cart",
        "short": "Brand Activations",
        "h1": "Brand activation coffee cart catering",
        "eyebrow": "Campaigns · launches · experiential",
        "lead": "A specialty espresso cart that pulls people in — drinks that fit the campaign and a café moment that makes the activation feel alive.",
        "meta": "Brand activation coffee cart catering in Central Florida — mobile espresso for launches and experiential events. Get a quote from Jude.",
        "og_title": "Brand Activation Coffee Cart | Jude",
        "hero_img": "/images/geo-detail.jpg",
        "hero_alt": "Jude coffee service at a brand event",
        "why_title": "Why brands book Jude",
        "why": [
            ("Foot traffic magnet", "A working espresso bar draws people and holds them longer."),
            ("On-brand hospitality", "Menu cues and service style that match the campaign tone."),
            ("Reliable ops", "We run the cart so your team can run the activation."),
            ("Central Florida reach", "Lakeland home base with Tampa and Orlando travel."),
        ],
        "body_sections": [
            (
                "Espresso as experiential hospitality",
                "Brand activations need more than a backdrop. Jude brings specialty coffee cart catering that gives guests something to order, hold, and talk about — while your team works the room.",
            ),
            (
                "Built for campaign days",
                "Product launches, sampling days, influencer gatherings, and street-team style setups. Share brand guidelines and we will discuss what we can support for cups, menu naming, and timing.",
            ),
        ],
        "types_title": "Activation formats we support",
        "types": [
            "Product launches",
            "Pop-up brand experiences",
            "Sampling days",
            "Influencer gatherings",
            "Retail takeovers",
            "Conference booth hospitality",
            "Campus and tour stops",
            "Press and media mornings",
        ],
        "steps_title": "How booking a brand activation works",
        "steps": [
            ("Brief the moment", "Date, place, audience, and what the campaign needs to feel like."),
            ("We map the pour", "Menu and window shaped to foot traffic and brand cues."),
            ("On-site calm", "Quiet setup, confident service, clean pack-out."),
            ("Learn for next time", "A short debrief so the next market lands even better."),
        ],
        "faqs": [
            (
                "Can drinks be named for the campaign?",
                "Often yes — share naming ideas with your quote request.",
            ),
            (
                "Do you work with agencies and experiential teams?",
                "Yes. Share the producer contact and load-in plan when you inquire.",
            ),
            (
                "Can you serve outdoor activations?",
                "Many outdoor setups work with power and a safe footprint. We confirm details per site.",
            ),
        ],
    },
    {
        "slug": "brand-pop-ups",
        "name": "Brand Pop-Up Coffee Cart",
        "short": "Brand Pop-Ups",
        "h1": "Brand pop-up coffee cart catering",
        "eyebrow": "Launches · retail · sampling",
        "lead": "Who to hire when a launch day, retail takeover, or sampling pop-up needs specialty espresso on site.",
        "meta": "Brand pop-up coffee cart catering in Central Florida — espresso for launches, retail takeovers, and sampling days. Get a quote from Jude.",
        "og_title": "Brand Pop-Up Coffee Cart | Jude",
        "hero_img": "/images/geo-cart.jpg",
        "hero_alt": "Jude coffee cart ready for a pop-up event",
        "why_title": "Why pop-ups book a coffee cart",
        "why": [
            ("Instant hospitality", "Guests arrive and have something to do — order a drink."),
            ("Flexible sites", "Retail floors, plazas, studios, and parking-lot pop-ups."),
            ("Fast service", "Baristas keep lines moving during peak traffic."),
            ("Clean exit", "We pack out so the space resets quickly."),
        ],
        "body_sections": [
            (
                "Coffee catering for launch days and retail moments",
                "Jude supports brand pop-ups across Central Florida with a mobile espresso cart sized for short, high-energy windows. If you need a café presence without building a permanent bar, we are built for that.",
            ),
        ],
        "types_title": "Pop-up formats",
        "types": [
            "Store openings",
            "Weekend sampling",
            "Market stalls",
            "Studio launches",
            "Campus pop-ups",
            "Hotel lobby takeovers",
            "Festival side activations",
            "Collab days with local shops",
        ],
        "steps_title": "How booking a brand pop-up works",
        "steps": [
            ("Share the site plan", "Hours, expected traffic, and power."),
            ("We price the window", "Staffing matched to the rush you expect."),
            ("Launch day", "We keep the line kind and the drinks dialed."),
            ("Clean reset", "Pack-out when you wrap — space left tidy."),
        ],
        "faqs": [
            (
                "How long should a pop-up coffee window be?",
                "Two to four hours is common. Share your traffic plan and we will recommend a window.",
            ),
            (
                "Can you handle a lunchtime rush?",
                "Yes — tell us peak timing so we staff and prep accordingly.",
            ),
        ],
    },
    {
        "slug": "office-coffee",
        "name": "Office Coffee Cart",
        "short": "Office Coffee",
        "h1": "Office coffee cart catering",
        "eyebrow": "One visit · recurring perks",
        "lead": "Bring a specialty espresso cart to the office for appreciation mornings, client days, or a repeating perk.",
        "meta": "Office coffee cart catering in Central Florida — mobile espresso for workplaces and recurring office visits. Get a quote from Jude.",
        "og_title": "Office Coffee Cart | Jude",
        "hero_img": "/images/prep.png",
        "hero_alt": "Barista pulling espresso for an office gathering",
        "why_title": "Why offices book Jude",
        "why": [
            ("Morale you can taste", "A café morning beats another box of grocery-store coffee."),
            ("Client-ready", "Impress visitors without leaving the building."),
            ("One visit or recurring", "Book a single morning or talk to us about a repeat cadence."),
            ("Minimal disruption", "We set up for your lobby or common area and pack out clean."),
        ],
        "body_sections": [
            (
                "Workplace espresso without a build-out",
                "Jude brings office coffee cart catering to Central Florida workplaces — from Lakeland offices to Tampa Bay towers and Orlando studios. One morning can reset the week; recurring visits turn coffee into a rhythm.",
            ),
        ],
        "types_title": "Office moments we serve",
        "types": [
            "Employee appreciation mornings",
            "Client visit hospitality",
            "New-hire welcome days",
            "Quarterly all-hands",
            "Department celebrations",
            "Wellness days",
            "Open house recruiting",
            "Vendor appreciation",
        ],
        "steps_title": "How booking office coffee works",
        "steps": [
            ("Share access & timing", "Floor notes, security, and when people gather."),
            ("We clear logistics", "Power and footprint figured out before we roll in."),
            ("We host the morning", "Espresso through your window — line stays humane."),
            ("Make it a rhythm", "Ask about monthly or quarterly visits that stick."),
        ],
        "faqs": [
            (
                "Can we book recurring office coffee?",
                "Often yes. Share the cadence you want and we will discuss availability.",
            ),
            (
                "Do you need a kitchen?",
                "No kitchen required — we need power and a workable footprint.",
            ),
        ],
    },
    {
        "slug": "conference-coffee-catering",
        "name": "Conference Coffee Catering",
        "short": "Conferences",
        "h1": "Conference coffee cart catering",
        "eyebrow": "Booths · breaks · multi-hour service",
        "lead": "Specialty espresso at your booth or throughout the day — so attendees have a reason to stop and stay.",
        "meta": "Conference coffee cart catering in Central Florida — mobile espresso for booths, breaks, and multi-hour events. Get a quote from Jude.",
        "og_title": "Conference Coffee Cart | Jude",
        "hero_img": "/images/geo-cart.jpg",
        "hero_alt": "Jude mobile coffee cart ready for event service",
        "why_title": "Why conferences book a coffee cart",
        "why": [
            ("Booth magnet", "Attendees follow the espresso."),
            ("All-day energy", "Service windows that match agendas and breaks."),
            ("Professional presence", "Trained baristas who keep the line respectful of session timing."),
            ("Simple vendor story", "One cart, clear setup, clean pack-out."),
        ],
        "body_sections": [
            (
                "Espresso for agendas that run long",
                "Jude provides conference coffee cart catering across Central Florida venues — from hotel ballrooms to expo floors. Use us at a single booth or as a hospitality hub between sessions.",
            ),
        ],
        "types_title": "Conference formats",
        "types": [
            "Expo booth hospitality",
            "Morning registration coffee",
            "Break-out session carts",
            "Sponsor lounges",
            "Multi-day conferences",
            "Association meetings",
            "Training institutes",
            "Industry summits",
        ],
        "steps_title": "How booking conference coffee works",
        "steps": [
            ("Share the agenda", "Peak breaks, booth rules, and where coffee should live."),
            ("We staff for volume", "Enough hands for the rush without a chaotic line."),
            ("Coordinate load-in", "Venue ops, power, and footprint — handled."),
            ("We hold the day", "Espresso from open through the last break."),
        ],
        "faqs": [
            (
                "Can you work inside a trade-show booth?",
                "Often yes if footprint and power allow. Send booth specs with your inquiry.",
            ),
            (
                "How do you handle rush breaks?",
                "We prep for peak windows — tell us when sessions let out.",
            ),
        ],
    },
    {
        "slug": "coffee-cart-rental",
        "name": "Coffee Cart Rental",
        "short": "Coffee Cart Rental",
        "h1": "Coffee cart rental in Central Florida",
        "eyebrow": "Full-service mobile espresso",
        "lead": "Looking for coffee cart rental near Lakeland, Tampa, or Orlando? Jude brings the cart, baristas, and menu — specialty espresso catering, not an empty trailer.",
        "meta": "Coffee cart rental in Central Florida — full-service mobile espresso catering for weddings, offices, and parties. Get a quote from Jude.",
        "og_title": "Coffee Cart Rental Central Florida | Jude",
        "hero_img": "/images/geo-close.jpg",
        "hero_alt": "Jude mobile coffee cart",
        "why_title": "What coffee cart rental with Jude includes",
        "why": [
            ("Full service", "Equipment, supplies, and trained baristas — not a bare rental."),
            ("Event-ready menu", "Espresso-based drinks, drip, and cold brew with house syrups."),
            ("Central Florida travel", "Lakeland based, serving Tampa Bay, Orlando, and nearby hubs."),
            ("Clear quoting", "Custom pricing from date, guest count, and service length."),
        ],
        "body_sections": [
            (
                "Coffee cart rental that actually serves drinks",
                "Search results for coffee cart rental often mean different things. With Jude, rental means a staffed specialty espresso experience: we arrive, set up, serve your guests, and pack out. That is catering — built around a beautiful mobile cart.",
            ),
            (
                "Where we go",
                "Weddings, corporate events, private parties, brand activations, and holiday gatherings across Central Florida. Browse our service area pages for city-specific details, or start with a quote.",
            ),
        ],
        "types_title": "Events that book coffee cart rental",
        "types": [
            "Weddings",
            "Corporate catering",
            "Private parties",
            "Brand activations",
            "Office visits",
            "Conferences",
            "Holiday parties",
            "Pop-ups",
        ],
        "steps_title": "How booking coffee cart rental works",
        "steps": [
            ("Share the essentials", "Date, place, guests, and service window."),
            ("Review the plan together", "Menu and timing confirmed in plain language."),
            ("Lock the date", "Your slot is held — logistics stay on us."),
            ("Event day", "Full-service cart, baristas, and a clean finish."),
        ],
        "faqs": [
            (
                "Is this a DIY cart rental?",
                "No. Jude is full-service coffee catering with baristas. We do not drop off an unattended cart.",
            ),
            (
                "What areas do you serve?",
                "Lakeland and Central Florida hubs including Tampa, St. Petersburg, Orlando, Winter Haven, Bradenton, Sarasota, and more.",
            ),
            (
                "How much does coffee cart rental cost?",
                "Every event is custom-quoted. Share your details through Get a quote for pricing.",
            ),
        ],
    },
]


def page(c: dict) -> str:
    slug = c["slug"]
    why_html = "\n".join(
        f'''          <article class="svc-why__item">
            <h3 class="svc-why__item-title">{esc(t)}</h3>
            <p>{esc(d)}</p>
          </article>'''
        for t, d in c["why"]
    )
    body_html = "\n".join(
        f'''        <section class="svc-block">
          <h2 class="svc-block__title">{esc(t)}</h2>
          <p class="svc-block__text">{esc(p)}</p>
        </section>'''
        for t, p in c["body_sections"]
    )
    types_html = "\n".join(f"          <li>{esc(t)}</li>" for t in c["types"])
    steps_html = "\n".join(
        f'''          <li class="svc-steps__item">
            <span class="svc-steps__num">{i}</span>
            <div>
              <h3 class="svc-steps__title">{esc(t)}</h3>
              <p>{esc(d)}</p>
            </div>
          </li>'''
        for i, (t, d) in enumerate(c["steps"], 1)
    )
    faq_html = "\n".join(
        f'''          <details class="geo-faq__item">
            <summary class="geo-faq__q">
              <span class="geo-faq__q-text">{esc(q)}</span>
              <span class="geo-faq__icon" aria-hidden="true"></span>
            </summary>
            <p class="geo-faq__a">{esc(a)}</p>
          </details>'''
        for q, a in c["faqs"]
    )
    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": f"https://judecoffee.com/services/{slug}#webpage",
                "url": f"https://judecoffee.com/services/{slug}",
                "name": f"{c['name']} | Jude",
                "description": c["meta"],
                "isPartOf": {"@id": "https://judecoffee.com/#website"},
                "about": {"@id": "https://judecoffee.com/#business"},
                "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": "https://judecoffee.com/",
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "Services",
                            "item": "https://judecoffee.com/services",
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": c["short"],
                            "item": f"https://judecoffee.com/services/{slug}",
                        },
                    ],
                },
            },
            {
                "@type": "Service",
                "@id": f"https://judecoffee.com/services/{slug}#service",
                "name": c["name"],
                "serviceType": c["name"],
                "provider": {"@id": "https://judecoffee.com/#business"},
                "areaServed": {"@type": "AdministrativeArea", "name": "Central Florida"},
                "url": f"https://judecoffee.com/services/{slug}",
                "description": c["meta"],
            },
            {
                "@type": "FAQPage",
                "@id": f"https://judecoffee.com/services/{slug}#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": q,
                        "acceptedAnswer": {"@type": "Answer", "text": a},
                    }
                    for q, a in c["faqs"]
                ],
            },
        ],
    }

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{esc(c["meta"])}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="https://judecoffee.com/services/{slug}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="Jude Coffee">
  <meta property="og:url" content="https://judecoffee.com/services/{slug}">
  <meta property="og:title" content="{esc(c["og_title"])}">
  <meta property="og:description" content="{esc(c["meta"])}">
  <meta property="og:image" content="https://judecoffee.com{c["hero_img"].split("?")[0]}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc(c["og_title"])}">
  <meta name="twitter:description" content="{esc(c["meta"])}">
  <meta name="theme-color" content="#69966B">
  <title>{esc(c["name"])} | Jude</title>
  <script type="application/ld+json">
{json.dumps(schema, indent=2, ensure_ascii=False)}
  </script>
  <link rel="icon" href="/images/favicon.png" type="image/png" sizes="32x32">
  <link rel="icon" href="/images/icon-mug-48.png" type="image/png" sizes="48x48">
  <link rel="apple-touch-icon" href="/images/icon-mug-180.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,500;9..40,600&family=Inter:wght@200;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css?v={CACHE}">
  <link rel="stylesheet" href="/css/mobile.css?v={CACHE}">
</head>
<body class="page-svc">
  <a href="#main" class="skip-link">Skip to content</a>
  <main id="main">
    <section class="svc-hero">
      <div class="svc-hero__media" aria-hidden="true">
        <img class="svc-hero__photo" src="{c["hero_img"]}" alt="" width="1200" height="1500" fetchpriority="high" decoding="async">
        <div class="svc-hero__shade"></div>
      </div>
      <a href="/" class="svc-hero__logo logo" aria-label="Jude — Home">
        <img src="/images/Artboard%201.png?v=20250812mob1" alt="" class="logo-img" width="1081" height="1081" decoding="async">
      </a>
      <div class="svc-hero__copy">
        <p class="svc-hero__eyebrow">{esc(c["eyebrow"])}</p>
        <h1 class="svc-hero__title">{esc(c["h1"])}</h1>
        <p class="svc-hero__lead">{esc(c["lead"])}</p>
        <div class="svc-hero__actions">
          <a class="btn" href="/contact">Get a quote</a>
          <a class="tagline-underline" href="/services">All services</a>
        </div>
      </div>
    </section>

    <section class="svc-why" aria-labelledby="svc-why-title">
      <div class="svc-why__inner">
        <h2 id="svc-why-title" class="svc-why__title">{esc(c["why_title"])}</h2>
        <div class="svc-why__grid">
{why_html}
        </div>
      </div>
    </section>

    <div class="svc-prose">
{body_html}
    </div>

    <section class="svc-types" aria-labelledby="svc-types-title">
      <div class="svc-types__inner">
        <h2 id="svc-types-title" class="svc-types__title">{esc(c["types_title"])}</h2>
        <ul class="svc-types__list">
{types_html}
        </ul>
      </div>
    </section>

    <section class="svc-steps" aria-labelledby="svc-steps-title">
      <div class="svc-steps__inner">
        <h2 id="svc-steps-title" class="svc-steps__title">{esc(c["steps_title"])}</h2>
        <ol class="svc-steps__list">
{steps_html}
        </ol>
      </div>
    </section>

    <section class="geo-faq svc-faq" aria-labelledby="svc-faq-title">
      <div class="geo-faq__inner">
        <h2 id="svc-faq-title" class="geo-faq__title">Frequently asked questions</h2>
{faq_html}
      </div>
    </section>

    <section class="svc-close" aria-labelledby="svc-close-title">
      <div class="svc-close__inner">
        <h2 id="svc-close-title" class="svc-close__title">Ready for {esc(c["short"].lower())} that feels considered?</h2>
        <p class="svc-close__lead">Tell us the date, venue, and guest count — we’ll send a thoughtful quote and make the next steps feel easy.</p>
        <a class="btn" href="/contact">Get a quote</a>
      </div>
    </section>
  </main>

{reviews_section(title=f"What clients say about Jude {c['short'].lower()}")}

{mega_footer()}

  <script src="/js/main.js?v={CACHE}"></script>
</body>
</html>
'''


def patch_sitemap() -> None:
    path = ROOT / "sitemap.xml"
    text = path.read_text()
    # Rebuild from scratch with hubs + services
    urls = [
        ("https://judecoffee.com/", "1.0"),
        ("https://judecoffee.com/menu", "0.9"),
        ("https://judecoffee.com/services", "0.95"),
        ("https://judecoffee.com/contact", "0.9"),
        ("https://judecoffee.com/reach-out", "0.8"),
    ]
    for slug, _ in HUBS:
        urls.append((f"https://judecoffee.com/{slug}", "0.9"))
    for slug, _ in SERVICES:
        urls.append((f"https://judecoffee.com/services/{slug}", "0.9"))

    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, pri in urls:
        lines += [
            "  <url>",
            f"    <loc>{loc}</loc>",
            f"    <lastmod>{TODAY}</lastmod>",
            "    <changefreq>weekly</changefreq>",
            f"    <priority>{pri}</priority>",
            "  </url>",
        ]
    lines.append("</urlset>")
    path.write_text("\n".join(lines) + "\n")
    print("updated sitemap.xml")


def main() -> None:
    for c in SERVICE_PAGES:
        hero = c["hero_img"].split("?")[0]
        if hero in BANNED_HERO_IMAGES:
            raise SystemExit(f"Banned hero image on {c['slug']}: {hero}")
        path = OUT / f"{c['slug']}.html"
        path.write_text(page(c))
        print("wrote", path.relative_to(ROOT))
    patch_sitemap()


if __name__ == "__main__":
    main()
