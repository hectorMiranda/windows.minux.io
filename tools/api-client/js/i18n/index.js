import { en } from './en.js';
import { es } from './es.js';
import { fr } from './fr.js';
import { de } from './de.js';
import { pt } from './pt.js';
import { it } from './it.js';
import { ja } from './ja.js';
import { zh } from './zh.js';
import { ko } from './ko.js';
import { ru } from './ru.js';
import { nl } from './nl.js';
import { pl } from './pl.js';
export const LOCALES = { en, es, fr, de, pt, it, ja, zh, ko, ru, nl, pl };
export const LOCALE_NAMES = {"en": "English", "es": "Español", "fr": "Français", "de": "Deutsch", "pt": "Português", "it": "Italiano", "ja": "日本語", "zh": "中文", "ko": "한국어", "ru": "Русский", "nl": "Nederlands", "pl": "Polski"};
let active = 'en';
export function setLocale(code) { if (LOCALES[code]) active = code; }
export function t(key) { return (LOCALES[active] && LOCALES[active][key]) || (LOCALES.en[key]) || key; }
export function availableLocales() { return Object.keys(LOCALES); }
