#!/usr/bin/env python3
"""Shared hub/service lists + mega footer for Jude SEO pages."""

from __future__ import annotations

import html

CACHE = "20261104areas1"

HUBS = [
    ("lakeland", "Lakeland, FL"),
    ("tampa", "Tampa, FL"),
    ("orlando", "Orlando, FL"),
    ("winter-haven", "Winter Haven, FL"),
    ("bradenton", "Bradenton, FL"),
    ("sarasota", "Sarasota, FL"),
    ("st-petersburg", "St. Petersburg, FL"),
    ("clearwater", "Clearwater, FL"),
    ("kissimmee", "Kissimmee, FL"),
    ("plant-city", "Plant City, FL"),
    ("brandon", "Brandon, FL"),
    ("bartow", "Bartow, FL"),
    ("auburndale", "Auburndale, FL"),
    ("clermont", "Clermont, FL"),
    ("sebring", "Sebring, FL"),
]

SERVICES = [
    ("corporate-coffee-catering", "Corporate Catering"),
    ("wedding-coffee-cart", "Wedding Coffee Bar"),
    ("private-parties", "Private Parties"),
    ("holiday-parties", "Holiday Parties"),
    ("brand-activations", "Brand Activations"),
    ("brand-pop-ups", "Brand Pop-Ups"),
    ("office-coffee", "Office Coffee"),
    ("conference-coffee-catering", "Conferences"),
    ("coffee-cart-rental", "Coffee Cart Rental"),
]

QUICK_LINKS = [
    ("/contact", "Get a Quote"),
    ("/menu", "Our Menu"),
    ("/services", "Catering Services"),
    ("/reach-out", "Reach Out"),
    ("/", "About Us"),
]

# Google reviews for Jude Coffee (exclude owner reviews from Dave / Caleb).
# Sourced from Google Maps cid=16430164943661015661 — 5.0 (12 reviews).
GOOGLE_REVIEWS_URL = (
    "https://www.google.com/maps/place/Jude+Coffee/"
    "@28.0622755,-81.947472/data=!4m8!3m7!1s0x4588035547880203:0xe403abf72bfda26d"
    "!8m2!3d28.0622755!4d-81.947472!9m1!1b1"
)

GOOGLE_REVIEWS = [
    {
        "name": "Ashlie Glendening",
        "when": "a month ago",
        "text": (
            "Jude coffee is the best mobile coffee you can book in Polk county! "
            "The coffee is so good, the staff is kind, and are the perfect addition "
            "to any event you have!"
        ),
    },
    {
        "name": "Natalie Wilson",
        "when": "a month ago",
        "text": (
            "Great coffee, great people, and a fantastic experience overall! "
            "The team at Jude Coffee brings incredible passion to their craft, "
            "and it shows in every cup. I look forward to having Jude Coffee again!"
        ),
    },
    {
        "name": "Angelique Insua",
        "when": "a week ago",
        "text": (
            "Tried Jude at the downtown Lakeland farmers market today while they "
            "were set up inside East of These, and the coffee was SO good! You can "
            "tell they genuinely care about the people they meet, and that makes "
            "their coffee even more special."
        ),
    },
    {
        "name": "Haddon Shelnut",
        "when": "a month ago",
        "text": (
            "Great guys, great coffee, great vibes. You’ll feel welcomed and "
            "appreciated here. Find new drinks, new recommendations and always "
            "walk out happy."
        ),
    },
    {
        "name": "Lily Sauger",
        "when": "a month ago",
        "text": (
            "Amazing customer service. They came and visited my church Grace City "
            "Tampa, and were so kind. The coffee is very strong! Just how I like it. "
            "I recommend! Go give them a try"
        ),
    },
    {
        "name": "Matt Glendening",
        "when": "a month ago",
        "text": "Hands down the best coffee in Central Florida!",
    },
    {
        "name": "Robert Mainellis",
        "when": "a month ago",
        "text": "The best coffee I’ve ever had and the nicest dudes in the world!!!",
    },
    {
        "name": "Martinez Wedding",
        "when": "a month ago",
        "text": "Love these guys! Great coffee and amazing prices!",
    },
    {
        "name": "koko r",
        "when": "a week ago",
        "text": (
            "Met Caleb & David @ Lakeland’s Farmers Market today. Excellent coffee "
            "& excellent customer service. Super nice guys!"
        ),
    },
]


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def stars_html() -> str:
    return (
        '<span class="reviews__stars" aria-label="5 out of 5 stars">'
        '<span aria-hidden="true">★★★★★</span>'
        "</span>"
    )


def reviews_section(
    *,
    title: str = "Kind words from the room",
    lead: str = (
        "Real notes from weddings, offices, markets, and parties — the kind of "
        "hospitality people remember after the last cup."
    ),
) -> str:
    cards = []
    for r in GOOGLE_REVIEWS:
        cards.append(
            f'''        <article class="reviews__card">
          {stars_html()}
          <p class="reviews__quote">“{esc(r["text"])}”</p>
          <p class="reviews__name">{esc(r["name"])}</p>
          <p class="reviews__when">{esc(r["when"])}</p>
        </article>'''
        )
    cards_html = "\n".join(cards)
    return f'''  <section class="reviews" aria-labelledby="reviews-title" data-reviews>
    <div class="reviews__inner">
      <h2 id="reviews-title" class="reviews__title">{esc(title)}</h2>
      <p class="reviews__lead">{esc(lead)}</p>
      <div class="reviews__viewport">
        <button type="button" class="reviews__nav reviews__nav--prev" data-reviews-prev aria-label="Previous reviews">
          <span aria-hidden="true">‹</span>
        </button>
        <div class="reviews__track" data-reviews-track tabindex="0" aria-label="Google reviews">
{cards_html}
        </div>
        <button type="button" class="reviews__nav reviews__nav--next" data-reviews-next aria-label="Next reviews">
          <span aria-hidden="true">›</span>
        </button>
      </div>
      <div class="reviews__summary">
        {stars_html()}
        <p class="reviews__aggregate">5.0 (12 reviews)</p>
        <a class="reviews__all" href="{GOOGLE_REVIEWS_URL}" target="_blank" rel="noopener noreferrer">Read all reviews on Google <span aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>'''


def mega_footer() -> str:
    quick = "\n".join(
        f'            <li><a href="{href}">{esc(label)}</a></li>' for href, label in QUICK_LINKS
    )
    services = "\n".join(
        f'            <li><a href="/services/{slug}">{esc(label)}</a></li>'
        for slug, label in SERVICES
    )
    hubs = "\n".join(
        f'            <li><a href="/{slug}">{esc(label)}</a></li>' for slug, label in HUBS
    )
    return f'''  <footer class="site-footer site-footer--mega">
    <div class="footer-mega">
      <div class="footer-mega__brand">
        <a href="/" class="footer-mega__logo" aria-label="Jude — Home">
          <img src="/images/logo-cream.png" alt="" width="220" height="88" decoding="async">
        </a>
        <p class="footer-mega__blurb">Specialty mobile espresso for weddings, offices, and parties across Central Florida.</p>
        <p class="footer-mega__social">
          <a href="https://www.instagram.com/judeforall/" target="_blank" rel="noopener noreferrer">Instagram</a>
        </p>
      </div>
      <div class="footer-mega__col">
        <h2 class="footer-mega__heading">Quick Links</h2>
        <ul class="footer-mega__list">
{quick}
        </ul>
      </div>
      <div class="footer-mega__col">
        <h2 class="footer-mega__heading">Our Services</h2>
        <ul class="footer-mega__list">
{services}
        </ul>
      </div>
      <div class="footer-mega__col">
        <h2 class="footer-mega__heading">Service Areas</h2>
        <ul class="footer-mega__list">
{hubs}
        </ul>
      </div>
      <div class="footer-mega__col">
        <h2 class="footer-mega__heading">Contact Info</h2>
        <ul class="footer-mega__list footer-mega__list--contact">
          <li><a href="mailto:info@judecoffee.com">info@judecoffee.com</a></li>
          <li><a href="/contact">Get a quote</a></li>
          <li>Proudly serving Lakeland, Tampa Bay, Orlando &amp; beyond</li>
        </ul>
      </div>
    </div>
    <p class="footer-mega__copy">© 2026 Jude Coffee. All rights reserved.</p>
  </footer>'''
