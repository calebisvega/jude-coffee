#!/usr/bin/env python3
"""Shared hub/service lists + mega footer for Jude SEO pages."""

from __future__ import annotations

import html

CACHE = "20261103svc1"

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
    ("/lakeland", "Lakeland Home Base"),
]


def esc(s: str) -> str:
    return html.escape(s, quote=True)


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
    nearby = (
        "Hyde Park, Winter Park, Lakewood Ranch, Siesta Key, Celebration, "
        "Lake Nona, Westshore, Clearwater Beach, FishHawk, Lake Mirror"
    )
    return f'''  <footer class="site-footer site-footer--mega">
    <div class="footer-mega">
      <div class="footer-mega__brand">
        <a href="/" class="footer-mega__logo" aria-label="Jude — Home">
          <img src="/images/logo-transparent.png" alt="" width="220" height="220" decoding="async">
        </a>
        <p class="footer-mega__blurb">Specialty mobile espresso for weddings, offices, and parties across Central Florida — based in Lakeland, traveling wherever the event is.</p>
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
        <h3 class="footer-mega__sub">Central Florida hubs</h3>
        <p class="footer-mega__nearby">{esc(nearby)}</p>
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
