#!/usr/bin/env python3
"""Generate Jude city SEO landing pages + sitemap entries."""

from __future__ import annotations

import html
import json
from datetime import date
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from site_common import CACHE, mega_footer  # noqa: E402

TODAY = date.today().isoformat()

# Location heroes: full cart / brand scenes only.
# Banned as heroes (too tight, square, or candid crops):
#   geo-setup.jpg, geo-latte.jpg, geo-deep-wedding.jpg,
#   geo-deep-corporate.jpg, geo-deep-private.jpg
HERO_PHOTOS = [
    "/images/geo-cart.jpg",
    "/images/geo-cup.jpg",
    "/images/geo-close.jpg",
    "/images/geo-detail.jpg",
    "/images/geo-cart-alt.jpg",
]

# Allowed in body sections only (not heroes).
BODY_PHOTOS = HERO_PHOTOS + [
    "/images/geo-setup.jpg",
    "/images/geo-latte.jpg",
    "/images/geo-deep-wedding.jpg",
    "/images/geo-deep-corporate.jpg",
    "/images/geo-deep-private.jpg",
]

# Primary hubs Jude should rank for (existing + new)
HUBS = [
    {
        "slug": "lakeland",
        "name": "Lakeland",
        "region": "Polk County",
        "region_short": "Polk County",
        "priority": "1.0",
        "lead": "Specialty espresso for weddings, offices, and parties across Polk County.",
        "services_lead": "Corporate meetings, conferences, brand activations, weddings, private parties, and holiday gatherings in Lakeland.",
        "local_title": "Serving Lakeland &amp; Polk County",
        "local_lead": "Lakeland is home — Jude brings the cart to downtown venues, lakeside celebrations, offices, and gatherings across Polk County.",
        "areas": [
            "Downtown Lakeland", "Lake Mirror", "South Lakeland", "North Lakeland",
            "Winter Haven", "Bartow", "Auburndale", "Plant City", "Polk City",
            "Lake Wales", "Haines City", "Mulberry",
        ],
        "greater": "Winter Haven, Bartow, Auburndale, Lake Wales, Haines City, Mulberry, Polk City, Highland City",
        "deep_wedding": "Cocktail hour or reception — barns, lakeside celebrations, and downtown venues across Polk County.",
        "deep_corporate": "Office mornings, conferences, and client events across Lakeland and Winter Haven.",
        "deep_private": "Birthdays, anniversaries, and holiday parties throughout Polk County.",
        "faq_serve": "Yes. Jude is based in Lakeland and provides mobile espresso cart catering across Polk County and Central Florida.",
        "faq_areas": "We serve Lakeland, Winter Haven, Bartow, Auburndale, Plant City, Lake Wales, Haines City, and nearby Polk County communities.",
    },
    {
        "slug": "tampa",
        "name": "Tampa",
        "region": "Tampa Bay",
        "region_short": "Tampa Bay",
        "priority": "0.95",
        "lead": "Specialty espresso for weddings, offices, and parties across Tampa Bay.",
        "services_lead": "Corporate meetings, conferences, brand activations, weddings, private parties, and holiday gatherings in Tampa.",
        "local_title": "Serving Tampa &amp; Tampa Bay",
        "local_lead": "A specialty mobile coffee cart for venues, offices, and celebrations across Tampa Bay — from waterfront weddings to downtown brand moments.",
        "areas": [
            "Hyde Park", "South Tampa", "Ybor City", "Downtown Tampa", "Channelside",
            "Westshore", "Seminole Heights", "Davis Islands", "St. Petersburg",
            "Clearwater", "Brandon", "Wesley Chapel",
        ],
        "greater": "Hyde Park, South Tampa, Ybor City, Westshore, Channelside, Seminole Heights, Davis Islands, Wesley Chapel",
        "deep_wedding": "Cocktail hour, reception, or late-night at South Tampa venues, waterfront celebrations, and backyard receptions.",
        "deep_corporate": "Offices, conferences, and brand days across Westshore and downtown.",
        "deep_private": "Birthdays, showers, and holiday parties from Hyde Park to Seminole Heights.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to weddings, corporate events, brand activations, and private parties throughout Tampa and Tampa Bay.",
        "faq_areas": "We serve Tampa, St. Petersburg, Clearwater, Brandon, Wesley Chapel, Hyde Park, South Tampa, Ybor City, Westshore, and nearby Tampa Bay communities.",
    },
    {
        "slug": "orlando",
        "name": "Orlando",
        "region": "Greater Orlando",
        "region_short": "Greater Orlando",
        "priority": "0.95",
        "lead": "Specialty espresso for weddings, offices, and parties across Greater Orlando.",
        "services_lead": "Corporate meetings, conferences, brand activations, weddings, private parties, and holiday gatherings in Orlando.",
        "local_title": "Serving Orlando &amp; nearby",
        "local_lead": "Specialty coffee cart catering for Winter Park receptions, Lake Nona offices, downtown brand days, and celebrations across Greater Orlando.",
        "areas": [
            "Winter Park", "Downtown Orlando", "Lake Nona", "Dr. Phillips", "College Park",
            "Baldwin Park", "Thornton Park", "Celebration", "Kissimmee", "Oviedo",
            "Windermere", "Winter Garden",
        ],
        "greater": "Winter Park, Lake Nona, Dr. Phillips, College Park, Baldwin Park, Celebration, Windermere, Winter Garden",
        "deep_wedding": "Cocktail hour, dessert, or late night for Winter Park celebrations, hotel ballrooms, and garden venues.",
        "deep_corporate": "Conferences, office mornings, and brand activations across Lake Nona, downtown, and Dr. Phillips.",
        "deep_private": "Birthdays, showers, and holiday parties from College Park to Celebration.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to Orlando weddings, corporate events, brand activations, and private parties across Greater Orlando.",
        "faq_areas": "We serve Orlando, Winter Park, Lake Nona, Dr. Phillips, Kissimmee, Celebration, Oviedo, Windermere, Winter Garden, and nearby communities.",
    },
    {
        "slug": "winter-haven",
        "name": "Winter Haven",
        "region": "Polk County",
        "region_short": "Polk County",
        "priority": "0.9",
        "lead": "Specialty espresso for weddings, offices, and parties around Chain of Lakes country.",
        "services_lead": "Corporate meetings, brand days, weddings, and private parties across Winter Haven and nearby Polk County.",
        "local_title": "Serving Winter Haven &amp; nearby",
        "local_lead": "From lakeside receptions to downtown offices, Jude brings specialty coffee cart catering throughout Winter Haven and surrounding Polk towns.",
        "areas": [
            "Downtown Winter Haven", "Lake Howard", "Cypress Gardens", "Legoland area",
            "Eloise", "Inwood", "Wahneta", "Lake Alfred", "Dundee", "Haines City",
            "Auburndale", "Lakeland",
        ],
        "greater": "Lake Alfred, Dundee, Eloise, Inwood, Wahneta, Cypress Gardens, Legoland area",
        "deep_wedding": "Lakeside cocktail hours and receptions around Winter Haven’s Chain of Lakes.",
        "deep_corporate": "Office mornings and client events across Winter Haven and nearby Polk offices.",
        "deep_private": "Birthdays, showers, and holiday parties throughout Winter Haven and Lake Alfred.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to Winter Haven weddings, corporate events, and private parties across Polk County.",
        "faq_areas": "We serve Winter Haven, Lake Alfred, Dundee, Haines City, Auburndale, Lakeland, and nearby Chain of Lakes communities.",
    },
    {
        "slug": "bradenton",
        "name": "Bradenton",
        "region": "Manatee County",
        "region_short": "Manatee County",
        "priority": "0.9",
        "lead": "Specialty espresso for weddings, offices, and parties across Bradenton and Manatee County.",
        "services_lead": "Corporate gatherings, waterfront weddings, brand activations, and private parties in Bradenton.",
        "local_title": "Serving Bradenton &amp; Manatee",
        "local_lead": "Jude travels from Lakeland to Bradenton for specialty coffee cart catering — downtown venues, waterfront celebrations, and Gulf-coast offices.",
        "areas": [
            "Downtown Bradenton", "West Bradenton", "Lakewood Ranch", "Ellenton",
            "Palmetto", "Anna Maria Island", "Holmes Beach", "University Park",
            "Parrish", "Myakka City", "Cortez", "Bayshore Gardens",
        ],
        "greater": "Lakewood Ranch, Ellenton, Palmetto, Parrish, Anna Maria Island, Holmes Beach, Cortez",
        "deep_wedding": "Waterfront cocktail hours and island receptions from Bradenton to Anna Maria.",
        "deep_corporate": "Office mornings and brand days across Lakewood Ranch and downtown Bradenton.",
        "deep_private": "Birthdays and holiday parties throughout Manatee County.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to Bradenton and Manatee County for weddings, corporate events, and private parties.",
        "faq_areas": "We serve Bradenton, Lakewood Ranch, Ellenton, Palmetto, Parrish, Anna Maria Island, Holmes Beach, and nearby Manatee communities.",
    },
    {
        "slug": "sarasota",
        "name": "Sarasota",
        "region": "Sarasota County",
        "region_short": "Sarasota County",
        "priority": "0.9",
        "lead": "Specialty espresso for weddings, offices, and parties across Sarasota and Siesta Key.",
        "services_lead": "Arts-district brand days, Gulf-coast weddings, corporate gatherings, and private parties in Sarasota.",
        "local_title": "Serving Sarasota &amp; nearby",
        "local_lead": "From downtown galleries to Siesta Key celebrations, Jude brings specialty coffee cart catering throughout Sarasota County.",
        "areas": [
            "Downtown Sarasota", "Siesta Key", "Lido Key", "St. Armands",
            "Palmer Ranch", "Lakewood Ranch South", "Osprey", "Nokomis",
            "Venice", "Longboat Key", "Bird Key", "Gulf Gate",
        ],
        "greater": "Siesta Key, Lido Key, St. Armands, Palmer Ranch, Osprey, Nokomis, Venice, Longboat Key",
        "deep_wedding": "Beach and downtown receptions across Sarasota, Siesta Key, and Lido.",
        "deep_corporate": "Creative offices, conferences, and brand activations downtown and at Palmer Ranch.",
        "deep_private": "Private gatherings from St. Armands to Gulf Gate.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to Sarasota weddings, corporate events, and private parties across Sarasota County.",
        "faq_areas": "We serve Sarasota, Siesta Key, Lido Key, St. Armands, Palmer Ranch, Venice, Longboat Key, and nearby Gulf-coast communities.",
    },
    {
        "slug": "plant-city",
        "name": "Plant City",
        "region": "Hillsborough County",
        "region_short": "eastern Hillsborough",
        "priority": "0.85",
        "lead": "Specialty espresso for weddings, offices, and parties in Plant City and eastern Hillsborough.",
        "services_lead": "Strawberry-festival season pop-ups, barn weddings, corporate mornings, and private parties in Plant City.",
        "local_title": "Serving Plant City &amp; nearby",
        "local_lead": "Halfway between Lakeland and Tampa, Jude brings specialty coffee cart catering to Plant City venues, farms, and offices.",
        "areas": [
            "Downtown Plant City", "Walden Lake", "Trapnell", "Sydney",
            "Dover", "Seffner", "Thonotosassa", "Mango", "Valrico",
            "Brandon", "Lakeland", "Durham",
        ],
        "greater": "Walden Lake, Dover, Seffner, Thonotosassa, Mango, Valrico, Trapnell",
        "deep_wedding": "Barn and backyard receptions across Plant City and eastern Hillsborough.",
        "deep_corporate": "Office mornings and local brand days between Plant City and Brandon.",
        "deep_private": "Birthdays and holiday parties throughout Plant City and Dover.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to Plant City for weddings, corporate events, and private parties.",
        "faq_areas": "We serve Plant City, Walden Lake, Dover, Seffner, Valrico, Brandon, and nearby eastern Hillsborough communities.",
    },
    {
        "slug": "bartow",
        "name": "Bartow",
        "region": "Polk County",
        "region_short": "Polk County",
        "priority": "0.85",
        "lead": "Specialty espresso for weddings, offices, and parties in Bartow and south Polk.",
        "services_lead": "Courthouse-district gatherings, ranch weddings, corporate mornings, and private parties in Bartow.",
        "local_title": "Serving Bartow &amp; south Polk",
        "local_lead": "Jude brings specialty coffee cart catering to Bartow venues, offices, and celebrations across south Polk County.",
        "areas": [
            "Downtown Bartow", "South Bartow", "Highland City", "Fort Meade",
            "Mulberry", "Eagle Lake", "Wahneta", "Alturas", "Homeland",
            "Lakeland", "Winter Haven", "Frostproof",
        ],
        "greater": "Fort Meade, Mulberry, Eagle Lake, Highland City, Alturas, Homeland, Frostproof",
        "deep_wedding": "Ranch and downtown receptions across Bartow and south Polk.",
        "deep_corporate": "County offices and local business gatherings in Bartow.",
        "deep_private": "Private celebrations throughout Bartow and Fort Meade.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to Bartow weddings, corporate events, and private parties.",
        "faq_areas": "We serve Bartow, Fort Meade, Mulberry, Eagle Lake, Highland City, Frostproof, and nearby south Polk communities.",
    },
    {
        "slug": "auburndale",
        "name": "Auburndale",
        "region": "Polk County",
        "region_short": "Polk County",
        "priority": "0.85",
        "lead": "Specialty espresso for weddings, offices, and parties in Auburndale and nearby Polk.",
        "services_lead": "Lake-community weddings, office mornings, and private parties across Auburndale.",
        "local_title": "Serving Auburndale &amp; nearby",
        "local_lead": "Between Lakeland and Winter Haven, Jude brings specialty coffee cart catering to Auburndale venues and gatherings.",
        "areas": [
            "Downtown Auburndale", "Lake Ariana", "Berkley", "Polk City",
            "Lake Alfred", "Winter Haven", "Lakeland", "Kathleen",
            "Gibsonia", "Jan Phyl Village", "Fussels Corner", "Combee Settlement",
        ],
        "greater": "Lake Ariana, Berkley, Polk City, Lake Alfred, Kathleen, Gibsonia",
        "deep_wedding": "Lake-community receptions around Auburndale and Lake Ariana.",
        "deep_corporate": "Local offices and team days between Auburndale and Polk City.",
        "deep_private": "Birthdays and holiday parties throughout Auburndale.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to Auburndale for weddings, corporate events, and private parties.",
        "faq_areas": "We serve Auburndale, Polk City, Lake Alfred, Berkley, Kathleen, and nearby Polk County communities.",
    },
    {
        "slug": "kissimmee",
        "name": "Kissimmee",
        "region": "Osceola County",
        "region_short": "Osceola County",
        "priority": "0.9",
        "lead": "Specialty espresso for weddings, offices, and parties across Kissimmee and Celebration.",
        "services_lead": "Resort weddings, brand activations, corporate gatherings, and private parties in Kissimmee.",
        "local_title": "Serving Kissimmee &amp; Osceola",
        "local_lead": "Jude brings specialty coffee cart catering to Kissimmee venues, Celebration events, and Osceola County offices.",
        "areas": [
            "Downtown Kissimmee", "Celebration", "Poinciana", "St. Cloud",
            "Harmony", "Champions Gate", "Four Corners", "Buenaventura Lakes",
            "Lake Tohopekaliga", "NeoCity", "Campbell", "Intercession City",
        ],
        "greater": "Celebration, Poinciana, St. Cloud, Harmony, Champions Gate, Four Corners, NeoCity",
        "deep_wedding": "Resort and Celebration receptions across Kissimmee and Osceola.",
        "deep_corporate": "Brand activations and office mornings near NeoCity and Champions Gate.",
        "deep_private": "Private parties from Poinciana to St. Cloud.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to Kissimmee weddings, corporate events, and private parties across Osceola County.",
        "faq_areas": "We serve Kissimmee, Celebration, Poinciana, St. Cloud, Harmony, Champions Gate, and nearby Osceola communities.",
    },
    {
        "slug": "clermont",
        "name": "Clermont",
        "region": "Lake County",
        "region_short": "Lake County",
        "priority": "0.85",
        "lead": "Specialty espresso for weddings, offices, and parties across Clermont and south Lake County.",
        "services_lead": "Hill-country weddings, corporate mornings, and private parties in Clermont.",
        "local_title": "Serving Clermont &amp; Lake County",
        "local_lead": "Jude travels from Lakeland to Clermont for specialty coffee cart catering across south Lake County venues and offices.",
        "areas": [
            "Downtown Clermont", "Minneola", "Montverde", "Groveland",
            "Mascotte", "Four Corners", "Winter Garden", "Oakley",
            "South Clermont", "Lake Minnehaha", "Hills of Minneola", "Howey-in-the-Hills",
        ],
        "greater": "Minneola, Montverde, Groveland, Mascotte, Winter Garden, Howey-in-the-Hills",
        "deep_wedding": "Hilltop and lakefront receptions across Clermont and Minneola.",
        "deep_corporate": "Office mornings and team days throughout south Lake County.",
        "deep_private": "Private celebrations from Clermont to Groveland.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to Clermont weddings, corporate events, and private parties.",
        "faq_areas": "We serve Clermont, Minneola, Montverde, Groveland, Winter Garden, and nearby south Lake County communities.",
    },
    {
        "slug": "st-petersburg",
        "name": "St. Petersburg",
        "region": "Pinellas County",
        "region_short": "Pinellas County",
        "priority": "0.9",
        "lead": "Specialty espresso for weddings, offices, and parties across St. Petersburg and Pinellas.",
        "services_lead": "Downtown brand days, waterfront weddings, corporate gatherings, and private parties in St. Pete.",
        "local_title": "Serving St. Petersburg &amp; Pinellas",
        "local_lead": "Jude brings specialty coffee cart catering to St. Petersburg venues, downtown studios, and Pinellas celebrations.",
        "areas": [
            "Downtown St. Pete", "Snell Isle", "Old Northeast", "Kenwood",
            "Gulfport", "Treasure Island", "Madeira Beach", "Pinellas Park",
            "Seminole", "Largo", "Shore Acres", "Coquina Key",
        ],
        "greater": "Snell Isle, Old Northeast, Kenwood, Gulfport, Treasure Island, Pinellas Park, Largo",
        "deep_wedding": "Waterfront and downtown receptions across St. Petersburg.",
        "deep_corporate": "Creative offices and conferences downtown and in Pinellas Park.",
        "deep_private": "Private parties from Old Northeast to Gulfport.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to St. Petersburg weddings, corporate events, and private parties across Pinellas County.",
        "faq_areas": "We serve St. Petersburg, Gulfport, Treasure Island, Pinellas Park, Largo, Seminole, and nearby Pinellas communities.",
    },
    {
        "slug": "clearwater",
        "name": "Clearwater",
        "region": "Pinellas County",
        "region_short": "Pinellas County",
        "priority": "0.9",
        "lead": "Specialty espresso for weddings, offices, and parties across Clearwater and the beaches.",
        "services_lead": "Beach weddings, corporate mornings, brand activations, and private parties in Clearwater.",
        "local_title": "Serving Clearwater &amp; nearby",
        "local_lead": "From Clearwater Beach to downtown offices, Jude brings specialty coffee cart catering throughout north Pinellas.",
        "areas": [
            "Clearwater Beach", "Downtown Clearwater", "Island Estates", "Countryside",
            "Safety Harbor", "Dunedin", "Palm Harbor", "Oldsmar",
            "Belleair", "Largo", "Sand Key", "Coachman",
        ],
        "greater": "Clearwater Beach, Safety Harbor, Dunedin, Palm Harbor, Oldsmar, Belleair, Sand Key",
        "deep_wedding": "Beach and bayfront receptions across Clearwater and Sand Key.",
        "deep_corporate": "Office mornings and brand days from Countryside to downtown Clearwater.",
        "deep_private": "Private parties throughout Clearwater, Dunedin, and Safety Harbor.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to Clearwater weddings, corporate events, and private parties.",
        "faq_areas": "We serve Clearwater, Clearwater Beach, Safety Harbor, Dunedin, Palm Harbor, Oldsmar, and nearby Pinellas communities.",
    },
    {
        "slug": "brandon",
        "name": "Brandon",
        "region": "Hillsborough County",
        "region_short": "Hillsborough County",
        "priority": "0.85",
        "lead": "Specialty espresso for weddings, offices, and parties across Brandon and east Tampa Bay.",
        "services_lead": "Suburban weddings, office mornings, brand days, and private parties in Brandon.",
        "local_title": "Serving Brandon &amp; nearby",
        "local_lead": "Jude brings specialty coffee cart catering to Brandon venues, offices, and celebrations across east Hillsborough.",
        "areas": [
            "Brandon", "Valrico", "Seffner", "Riverview", "Bloomingdale",
            "FishHawk", "Lithia", "Mango", "Progress Village",
            "Palm River", "Gibsonton", "Apollo Beach",
        ],
        "greater": "Valrico, Seffner, Riverview, Bloomingdale, FishHawk, Lithia, Apollo Beach",
        "deep_wedding": "Backyard and venue receptions across Brandon, Valrico, and FishHawk.",
        "deep_corporate": "Office mornings and team days throughout Brandon and Riverview.",
        "deep_private": "Private parties from Bloomingdale to Lithia.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to Brandon weddings, corporate events, and private parties.",
        "faq_areas": "We serve Brandon, Valrico, Seffner, Riverview, Bloomingdale, FishHawk, Lithia, and nearby east Hillsborough communities.",
    },
    {
        "slug": "sebring",
        "name": "Sebring",
        "region": "Highlands County",
        "region_short": "Highlands County",
        "priority": "0.8",
        "lead": "Specialty espresso for weddings, offices, and parties across Sebring and Highlands County.",
        "services_lead": "Race-weekend activations, lake weddings, corporate mornings, and private parties in Sebring.",
        "local_title": "Serving Sebring &amp; Highlands",
        "local_lead": "Jude travels south from Lakeland for specialty coffee cart catering across Sebring, Avon Park, and Highlands County.",
        "areas": [
            "Downtown Sebring", "Lake Jackson", "Sun N Lake", "Avon Park",
            "Lake Placid", "Spring Lake", "Lorida", "Venus",
            "Highlands Park", "Desoto City", "Fort Drum", "Frostproof",
        ],
        "greater": "Avon Park, Lake Placid, Sun N Lake, Spring Lake, Lorida, Frostproof",
        "deep_wedding": "Lake-country receptions across Sebring and Avon Park.",
        "deep_corporate": "Local offices and event activations around Sebring.",
        "deep_private": "Private parties throughout Highlands County.",
        "faq_serve": "Yes. Jude brings a mobile espresso cart to Sebring weddings, corporate events, and private parties across Highlands County.",
        "faq_areas": "We serve Sebring, Avon Park, Lake Placid, Sun N Lake, Frostproof, and nearby Highlands County communities.",
    },
]


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def places_html(areas: list[str]) -> str:
    rows = []
    for i, a in enumerate(areas):
        cls = "geo-places__name is-active" if i == 0 else "geo-places__name"
        hidden = "" if i == 0 else ' aria-hidden="true"'
        rows.append(f'            <span class="{cls}"{hidden}>{esc(a)}</span>')
    return "\n".join(rows)


def marquee_field(areas: list[str], rows: int = 14) -> str:
    def group(order: list[str]) -> str:
        spans = " ".join(
            f'<span class="geo-marquee__item">{esc(a)}</span>'
            f'<span class="geo-marquee__dot" aria-hidden="true">·</span>'
            for a in order
        )
        return (
            f'<div class="geo-marquee__group">{spans}</div>'
            f'<div class="geo-marquee__group">{spans}</div>'
        )

    blocks = []
    for i in range(rows):
        order = list(reversed(areas)) if i % 2 else areas
        cls = "geo-marquee geo-marquee--reverse" if i % 2 else "geo-marquee"
        blocks.append(
            f'        <div class="{cls}">\n'
            f'          <div class="geo-marquee__track">\n'
            f'            {group(order)}\n'
            f'          </div>\n'
            f'        </div>'
        )
    return (
        '      <div class="geo-marquee-field" aria-hidden="true">\n'
        + "\n".join(blocks)
        + "\n      </div>"
    )


def hidden_list(areas: list[str]) -> str:
    return "\n".join(f"        <li>{esc(a)}</li>" for a in areas)


def service_areas_html(current_slug: str) -> str:
    hubs = [h for h in HUBS]
    primary = "\n".join(
        f'          <li><a href="/{h["slug"]}">{esc(h["name"])}, FL</a></li>'
        for h in hubs
    )
    current = next(h for h in hubs if h["slug"] == current_slug)
    return f'''    <section class="geo-service-areas" aria-labelledby="geo-service-areas-title">
      <div class="geo-service-areas__inner">
        <h2 id="geo-service-areas-title" class="geo-service-areas__title">Service Areas</h2>
        <ul class="geo-service-areas__hubs">
{primary}
        </ul>
        <h3 class="geo-service-areas__sub">{esc(current["name"])} &amp; {current["region_short"]}</h3>
        <p class="geo-service-areas__nearby">{esc(current["greater"])}</p>
      </div>
    </section>'''


def page(c: dict, photo_i: int) -> str:
    slug = c["slug"]
    name = c["name"]
    hero = HERO_PHOTOS[photo_i % len(HERO_PHOTOS)]
    services_img = BODY_PHOTOS[(photo_i + 2) % len(BODY_PHOTOS)]
    if services_img == hero:
        services_img = BODY_PHOTOS[(photo_i + 3) % len(BODY_PHOTOS)]
    desc = (
        f"Coffee cart catering in {name} — mobile espresso for weddings, corporate events, "
        f"and private parties across {c['region']}. Get a quote from Jude."
    )
    title = f"Coffee Cart {name} FL | Mobile Espresso Catering | Jude"
    og_title = f"Coffee Cart Catering in {name}, FL | Jude"
    hero_alt = f"Jude coffee cart catering in {name}"

    faq = [
        {
            "q": f"Do you provide coffee cart catering in {name}?",
            "a": c["faq_serve"],
        },
        {
            "q": f"What areas near {name} do you serve?",
            "a": c["faq_areas"],
        },
        {
            "q": f"How much does a coffee cart cost in {name}?",
            "a": (
                f"Every {name} event is custom-quoted from guest count, service length, and menu needs. "
                "Start with Get a quote and we will send pricing for your date and venue."
            ),
        },
        {
            "q": "What drinks are on the coffee cart menu?",
            "a": (
                "Espresso-based drinks, drip, and cold brew with house-made syrups. "
                f"See the full Jude menu, then tell us if you want a signature drink for your {name} event."
            ),
            "a_html": (
                "Espresso-based drinks, drip, and cold brew with house-made syrups. "
                f'<a href="/menu">See the full Jude menu</a>, then tell us if you want a signature drink for your {esc(name)} event.'
            ),
        },
    ]

    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": f"https://judecoffee.com/{slug}#webpage",
                "url": f"https://judecoffee.com/{slug}",
                "name": title,
                "description": desc,
                "isPartOf": {"@id": "https://judecoffee.com/#website"},
                "about": {"@id": "https://judecoffee.com/#business"},
                "primaryImageOfPage": {
                    "@type": "ImageObject",
                    "url": f"https://judecoffee.com{hero}",
                },
                "inLanguage": "en-US",
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
                            "name": f"{name} coffee cart",
                            "item": f"https://judecoffee.com/{slug}",
                        },
                    ],
                },
            },
            {
                "@type": "Service",
                "@id": f"https://judecoffee.com/{slug}#service",
                "name": f"Coffee cart catering in {name}",
                "alternateName": [
                    f"Mobile espresso cart {name}",
                    f"Coffee catering {name}",
                    f"Wedding coffee cart {name}",
                ],
                "serviceType": [
                    "Mobile coffee catering",
                    "Coffee cart rental",
                    "Espresso bar catering",
                ],
                "provider": {"@id": "https://judecoffee.com/#business"},
                "areaServed": [
                    {
                        "@type": "City",
                        "name": name,
                        "containedInPlace": {"@type": "State", "name": "Florida"},
                    },
                    {"@type": "AdministrativeArea", "name": c["region"]},
                ],
                "url": f"https://judecoffee.com/{slug}",
                "description": desc,
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": f"{name} coffee cart services",
                    "itemListElement": [
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": f"Wedding coffee cart in {name}",
                            },
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": f"Corporate coffee catering in {name}",
                            },
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": f"Private party coffee cart in {name}",
                            },
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": f"Brand activation coffee cart in {name}",
                            },
                        },
                    ],
                },
            },
            {
                "@type": "FAQPage",
                "@id": f"https://judecoffee.com/{slug}#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": item["q"],
                        "acceptedAnswer": {"@type": "Answer", "text": item["a"]},
                    }
                    for item in faq
                ],
            },
        ],
    }

    faq_html = "\n".join(
        f'''        <details class="geo-faq__item">
          <summary class="geo-faq__q">
            <span class="geo-faq__q-text">{esc(item["q"])}</span>
            <span class="geo-faq__icon" aria-hidden="true"></span>
          </summary>
          <p class="geo-faq__a">{item.get("a_html") or esc(item["a"])}</p>
        </details>'''
        for item in faq
    )

    services = [
        ("Corporate Events", "Meetings, appreciation mornings, and client days that feel considered — not cafeteria."),
        ("Conferences", "A cart that draws people in and keeps the day moving with real espresso."),
        ("Brand Activations", "Drinks and cups that match the campaign, served with calm confidence."),
        ("Brand Pop-Ups", "Launches, sampling days, and takeovers with a bar guests actually linger at."),
        ("Office Coffee", "A one-day treat or a recurring rhythm that makes the office feel human again."),
        ("Weddings", "Cocktail hour, dessert, or late night — a coffee bar that cares for your guests."),
        ("Private Parties", "Birthdays, showers, and gatherings where hospitality is the gift."),
        ("Holiday Parties", "Seasonal pours for company parties that deserve better than a carafe."),
    ]
    services_html = "\n".join(
        f'''          <div class="geo-service">
            <h3 class="geo-service__title">{esc(t)}</h3>
            <p class="geo-service__desc">{esc(d)}</p>
          </div>'''
        for t, d in services
    )

    includes = [
        "Quiet setup and a clean pack-out",
        "Professional espresso machine, grinder, and bar kit",
        "Drinks pulled to order — not sitting in a pot",
        "House syrups and oat milk, ready for the menu",
        "Cups, lids, and everything guests need in hand",
        "Jude baristas who host as carefully as they pour",
    ]
    includes_html = "\n".join(f"          <li>{esc(x)}</li>" for x in includes)

    book_steps = [
        (
            "01",
            "Share the day",
            "Send the date, place, guest count, and what you’re celebrating. We’ll check the calendar and reply with care — not a ticket number.",
        ),
        (
            "02",
            "We shape the pour",
            "Menu, pacing, and staffing sized to your people and the tone of the room. You get a clear plan; we carry the details.",
        ),
        (
            "03",
            "Lock the logistics",
            "Load-in, power, weather coverage, and where the cart lives. We coordinate with your venue or planner so nothing is left fuzzy.",
        ),
        (
            "04",
            "We host the moment",
            "Jude arrives early, dials in, serves with warmth, and packs out clean — so you stay present with your guests.",
        ),
    ]
    book_steps_html = "\n".join(
        f'''          <li class="geo-book__step">
            <span class="geo-book__num" aria-hidden="true">{num}</span>
            <h3 class="geo-book__step-title">{esc(title)}</h3>
            <p class="geo-book__step-copy">{esc(copy)}</p>
          </li>'''
        for num, title, copy in book_steps
    )

    article = "an" if name[:1].lower() in "aeiou" else "a"

    schema_json = json.dumps(schema, indent=2, ensure_ascii=False)

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="geo.region" content="US-FL">
  <meta name="geo.placename" content="{esc(name)}">
  <link rel="canonical" href="https://judecoffee.com/{slug}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="Jude Coffee">
  <meta property="og:url" content="https://judecoffee.com/{slug}">
  <meta property="og:title" content="{esc(og_title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:image" content="https://judecoffee.com{hero}">
  <meta property="og:image:width" content="1348">
  <meta property="og:image:height" content="1791">
  <meta property="og:image:alt" content="{esc(hero_alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc(og_title)}">
  <meta name="twitter:description" content="{esc(desc)}">
  <meta name="twitter:image" content="https://judecoffee.com{hero}">
  <meta name="theme-color" content="#69966B">
  <title>{esc(title)}</title>
  <script type="application/ld+json">
{schema_json}
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
<body class="page-geo page-geo--{slug}">
  <a href="#main" class="skip-link">Skip to content</a>

  <main id="main">
    <section class="geo-hero" aria-label="{esc(name)} coffee cart catering">
      <div class="geo-hero__media" aria-hidden="true">
        <img
          class="geo-hero__photo"
          src="{hero}"
          alt=""
          width="1348"
          height="1791"
          fetchpriority="high"
          decoding="async"
        >
        <div class="geo-hero__shade"></div>
      </div>

      <a href="/" class="geo-hero__logo logo" aria-label="Jude — Home">
        <img src="/images/logo-cream.png?v={CACHE}" alt="" class="logo-img logo-img--cream" width="480" height="192" decoding="async">
      </a>

      <div class="geo-hero__copy">
        <p class="geo-hero__eyebrow">Jude · {esc(name)}, FL</p>
        <h1 class="geo-hero__title">Coffee cart catering in {esc(name)}</h1>
        <p class="geo-hero__lead">{esc(c["lead"])}</p>
        <div class="geo-hero__actions">
          <a class="btn geo-btn" href="/contact">Get a quote</a>
          <a class="geo-text-link" href="/menu">View menu</a>
        </div>
      </div>
    </section>

    <section class="geo-services" aria-labelledby="geo-services-title">
      <div class="geo-services__intro">
        <div class="geo-services__intro-copy">
          <h2 id="geo-services-title" class="geo-services__title">Hospitality that<br>travels well —<br>weddings to offices</h2>
          <p class="geo-services__lead">{esc(c["services_lead"])}</p>
        </div>
        <a class="btn geo-btn geo-btn--ghost" href="/contact">Get a quote</a>
      </div>

      <div class="geo-services__grid">
        <figure class="geo-services__figure">
          <img
            src="{services_img}"
            alt="Jude coffee cart service in {esc(name)}"
            width="1348"
            height="1791"
            loading="lazy"
            decoding="async"
          >
        </figure>
        <div class="geo-services__list" role="list">
{services_html}
        </div>
      </div>
    </section>

    <section class="geo-book" aria-labelledby="geo-book-title">
      <div class="geo-book__inner">
        <h2 id="geo-book-title" class="geo-book__title">How to book {article} {esc(name)} coffee cart in four easy steps</h2>
        <ol class="geo-book__list">
{book_steps_html}
        </ol>
      </div>
    </section>

    <section class="geo-include" aria-labelledby="geo-include-title">
      <div class="geo-include__inner">
        <figure class="geo-include__figure">
          <img
            class="geo-include__photo"
            src="/images/geo-setup.jpg"
            alt="Guest enjoying a Jude coffee at an outdoor gathering"
            width="1348"
            height="1791"
            loading="lazy"
            decoding="async"
          >
        </figure>
        <h2 id="geo-include-title" class="geo-include__title">What arrives with Jude</h2>
        <p class="geo-include__lead">A complete specialty coffee experience for your {esc(name)} gathering — polished gear, practiced hands, and hospitality that feels like a gift to the room.</p>
        <ul class="geo-include__list">
{includes_html}
        </ul>
        <p class="geo-include__note">Peek the <a href="/menu">event menu</a> or browse everything we pour on <a href="/services">services</a>.</p>
      </div>
    </section>

    <section class="geo-local" aria-labelledby="geo-local-title">
      <div class="geo-local__inner">
        <h2 id="geo-local-title" class="geo-local__title">{c["local_title"]}</h2>
        <div class="geo-places" data-geo-flip aria-live="polite" aria-atomic="true">
          <p class="geo-places__cue">Now pouring in</p>
          <div class="geo-places__stage">
{places_html(c["areas"])}
          </div>
        </div>
        <p class="geo-local__lead">{esc(c["local_lead"])}</p>
      </div>
{marquee_field(c["areas"])}
      <ul class="visually-hidden">
{hidden_list(c["areas"])}
      </ul>
    </section>

    <section class="geo-deep" aria-label="Coffee cart services in {esc(name)}">
      <div class="geo-deep__grid">
        <article class="geo-deep__tile" tabindex="0">
          <img
            class="geo-deep__photo"
            src="/images/geo-deep-wedding.jpg"
            alt=""
            width="1200"
            height="1500"
            loading="lazy"
            decoding="async"
          >
          <div class="geo-deep__shade" aria-hidden="true"></div>
          <div class="geo-deep__copy">
            <h2 class="geo-deep__title">Weddings</h2>
            <p class="geo-deep__text">{esc(c["deep_wedding"])}</p>
          </div>
        </article>
        <article class="geo-deep__tile" tabindex="0">
          <img
            class="geo-deep__photo"
            src="/images/geo-deep-corporate.jpg?v=20261103corp2"
            alt=""
            width="1200"
            height="1500"
            loading="lazy"
            decoding="async"
          >
          <div class="geo-deep__shade" aria-hidden="true"></div>
          <div class="geo-deep__copy">
            <h2 class="geo-deep__title">Corporate events</h2>
            <p class="geo-deep__text">{esc(c["deep_corporate"])}</p>
          </div>
        </article>
        <article class="geo-deep__tile" tabindex="0">
          <img
            class="geo-deep__photo"
            src="/images/geo-deep-private.jpg"
            alt=""
            width="1200"
            height="1500"
            loading="lazy"
            decoding="async"
          >
          <div class="geo-deep__shade" aria-hidden="true"></div>
          <div class="geo-deep__copy">
            <h2 class="geo-deep__title">Private parties</h2>
            <p class="geo-deep__text">{esc(c["deep_private"])}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="geo-about" aria-labelledby="geo-about-title">
      <div class="geo-about__inner">
        <h2 id="geo-about-title" class="visually-hidden">About us</h2>
        <p class="geo-about__quote">
          Jude is a specialty coffee cart serving
          Central Florida with both care and delight.
          We&rsquo;re focused on offering beautiful coffees
          with intention and building real relationships
          through service in public and private events.
        </p>
      </div>
      <div
        class="geo-about__drag"
        id="geo-about-drag"
        data-geo-about-drag
        role="img"
        aria-label="Latte art in a Jude cup"
        tabindex="0"
      >
        <img
          class="geo-about__photo"
          src="/images/geo-latte.jpg?v=20261103latte1"
          alt=""
          width="768"
          height="1024"
          draggable="false"
          decoding="async"
        >
      </div>
    </section>

    <section class="geo-faq" aria-labelledby="geo-faq-title">
      <div class="geo-faq__inner">
        <h2 id="geo-faq-title" class="geo-faq__title">Coffee cart FAQs for {esc(name)}</h2>
{faq_html}
      </div>
    </section>

{service_areas_html(slug)}

    <section class="geo-close" aria-labelledby="geo-close-title">
      <div class="geo-close__media" aria-hidden="true">
        <img
          class="geo-close__photo"
          src="/images/geo-latte.jpg?v=20261103latte1"
          alt=""
          width="768"
          height="1024"
          loading="lazy"
          decoding="async"
        >
        <div class="geo-close__shade"></div>
      </div>
      <div class="geo-close__inner">
        <h2 id="geo-close-title" class="geo-close__title">Ready for beautiful coffee in {esc(name)}?</h2>
        <p class="geo-close__lead">Tell us the date, venue, and guest count — we’ll send a thoughtful quote and make booking feel easy from the first note.</p>
        <div class="geo-close__actions">
          <a class="btn" href="/contact">Get a quote</a>
          <a class="tagline-underline" href="/reach-out">Or say hello</a>
        </div>
      </div>
    </section>
  </main>

{mega_footer()}

  <script src="/js/main.js?v={CACHE}"></script>
  <script src="/js/geo.js?v={CACHE}"></script>
</body>
</html>
'''


def write_sitemap() -> None:
    urls = [
        ("https://judecoffee.com/", "1.0"),
        ("https://judecoffee.com/menu", "0.9"),
        ("https://judecoffee.com/services", "0.9"),
        ("https://judecoffee.com/contact", "0.9"),
        ("https://judecoffee.com/reach-out", "0.8"),
    ]
    for h in HUBS:
        urls.append((f"https://judecoffee.com/{h['slug']}", h["priority"]))

    body = ['<?xml version="1.0" encoding="UTF-8"?>']
    body.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for loc, priority in urls:
        body.append("  <url>")
        body.append(f"    <loc>{loc}</loc>")
        body.append(f"    <lastmod>{TODAY}</lastmod>")
        body.append("    <changefreq>weekly</changefreq>")
        body.append(f"    <priority>{priority}</priority>")
        body.append("  </url>")
    body.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(body) + "\n")


def main() -> None:
    for i, hub in enumerate(HUBS):
        path = ROOT / f"{hub['slug']}.html"
        path.write_text(page(hub, i))
        print("wrote", path.name)
    write_sitemap()
    print("wrote sitemap.xml")
    print(f"{len(HUBS)} hub pages ready")


if __name__ == "__main__":
    main()
