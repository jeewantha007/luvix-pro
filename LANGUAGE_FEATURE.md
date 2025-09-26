# Language Selection Feature

This document describes the language selection feature implemented in the LUVIX CRM Bot application.

## Overview

The language selection feature allows users to change the application language from a comprehensive list of supported languages. The feature includes:

- A modal dialog for language selection
- Support for 50+ languages with native names and flags
- Persistent language storage in localStorage
- Translation utility for easy text localization
- Integration with the existing Settings component

## How to Use

### For Users

1. Navigate to **Settings** in the application
2. Click on **Language** in the Appearance section
3. A modal will open showing all available languages
4. Click on your preferred language to select it
5. The language change will be applied immediately and saved

### For Developers

#### Adding New Languages

To add a new language, update the following files:

1. **`src/components/Settings/LanguageModal.tsx`**
   - Add the new language to the `availableLanguages` array
   - Include: `code`, `name`, `nativeName`, and `flag`

2. **`src/utils/translations.ts`**
   - Add translations for the new language in the `translations` object
   - Follow the existing structure for `settings`, `language`, and `common` sections

#### Using Translations in Components

```typescript
import { getTranslation } from '../utils/translations';
import { useApp } from '../context/AppContext';

const MyComponent = () => {
  const { language } = useApp();
  
  const t = (key: string) => getTranslation(language, key);
  
  return (
    <div>
      <h1>{t('settings.title')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
};
```

#### Translation Keys Structure

The translation system uses dot notation for nested keys:

- `settings.title` - Settings page title
- `settings.account` - Account section
- `settings.appearance` - Appearance section
- `language.title` - Language modal title
- `common.online` - Online status
- `common.offline` - Offline status

## Supported Languages

The application currently supports the following languages:

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Hindi (hi)
- Bengali (bn)
- Turkish (tr)
- Dutch (nl)
- Swedish (sv)
- Norwegian (no)
- Danish (da)
- Finnish (fi)
- Polish (pl)
- Czech (cs)
- Slovak (sk)
- Hungarian (hu)
- Romanian (ro)
- Bulgarian (bg)
- Croatian (hr)
- Serbian (sr)
- Slovenian (sl)
- Estonian (et)
- Latvian (lv)
- Lithuanian (lt)
- Maltese (mt)
- Greek (el)
- Hebrew (he)
- Thai (th)
- Vietnamese (vi)
- Indonesian (id)
- Malay (ms)
- Filipino (tl)
- Urdu (ur)
- Persian (fa)
- Amharic (am)
- Swahili (sw)
- Zulu (zu)
- Afrikaans (af)
- Icelandic (is)
- Irish (ga)
- Welsh (cy)
- Basque (eu)
- Catalan (ca)
- Galician (gl)

## Technical Implementation

### Components

- **`LanguageModal.tsx`** - The modal component for language selection
- **`Settings.tsx`** - Updated to include language selection functionality

### Context

- **`AppContext.tsx`** - Added language state management
- **`types/index.ts`** - Updated types to include language properties

### Utilities

- **`translations.ts`** - Translation utility with support for multiple languages

### State Management

The language is stored in:
- React state via AppContext
- localStorage for persistence
- Automatically loaded on application startup

## Future Enhancements

Potential improvements for the language feature:

1. **Automatic Language Detection** - Detect user's browser language
2. **RTL Support** - Add support for right-to-left languages
3. **Dynamic Loading** - Load translations on-demand
4. **Translation Management** - Admin interface for managing translations
5. **Pluralization** - Support for plural forms in different languages
6. **Date/Number Formatting** - Locale-specific formatting

## Files Modified

- `src/components/Settings/LanguageModal.tsx` (new)
- `src/components/Settings/Settings.tsx` (updated)
- `src/context/AppContext.tsx` (updated)
- `src/types/index.ts` (updated)
- `src/utils/translations.ts` (new)
- `LANGUAGE_FEATURE.md` (new)

## Testing

To test the language feature:

1. Open the application
2. Go to Settings
3. Click on Language
4. Select different languages and verify:
   - Modal displays correctly
   - Language changes are applied
   - Settings are persisted after page reload
   - All text elements are translated
