# AeroVista - Template System Documentation

## Phase 6: Template + Footer/Header Unification

This document outlines the templating system implemented in Phase 6 of the AeroVista website modernization project.

## Overview

The templating system provides a consistent way to build and maintain pages across the AeroVista website. It ensures that all pages share common elements like headers, footers, and styling while allowing for page-specific content.

## Template Structure

The templating system uses [Mustache.js](https://github.com/janl/mustache.js/) for HTML generation and follows a modular approach:

### Core Components

- **Header Template (`templates/header.html`)**: Contains the top part of each page including the `<head>` element with metadata, CSS imports, and the navigation bar.
- **Footer Template (`templates/footer.html`)**: Contains the bottom part of each page including contact form, footer links, and script imports.

### Page Templates

- **Page Template (`templates/page.html`)**: A basic page layout with a container for content.
- **Home Template (`templates/home.html`)**: Specialized template for the home page with hero section and other home-specific elements.
- **Division Template (`templates/division.html`)**: Template for division pages with specific layout and sections.
- **App Template (`templates/app.html`)**: Template for app pages with sections for features, screenshots, and more.

## How It Works

The templating system uses Node.js scripts to generate HTML pages from templates and data:

1. `src/templating.js`: Core templating functions that load templates, register partials, and render HTML.
2. `src/generate-pages.js`: Functions to generate specific pages with appropriate data.

## Using the System

### Generating Pages

Use the following npm scripts to generate pages:

```bash
# Generate all pages
npm run generate-pages

# Generate specific pages
npm run generate-home
npm run generate-about
npm run generate-divisions
npm run generate-apps
```

### Creating a New Page

To create a new page:

1. Create a page data object in `src/generate-pages.js`
2. Use an existing template or create a new template in the `templates/` directory
3. Call `templating.generatePage()` with the template name, data, and output path

### Template Syntax

The templating system uses Mustache.js syntax:

- `{{variable}}`: Outputs the value of a variable
- `{{{variable}}}`: Outputs the value without HTML escaping (useful for HTML content)
- `{{#section}}...{{/section}}`: Section blocks for conditional content or loops
- `{{> partial}}`: Includes a partial template

## Common Template Variables

### Header Template Variables

- `title`: Page title
- `description`: Meta description
- `og_description`: Open Graph description
- `canonical_url`: Canonical URL
- `page_id`: Page identifier for CSS targeting
- `custom_css`: Optional custom CSS for the page

### Page-specific Variables

- `page_title`: Title displayed on the page
- `page_content`: Main content for basic pages
- `division_name`, `app_name`: Names for division and app pages
- `features`, `services`: Arrays of features or services for division and app pages

## Maintainability Benefits

The templating system provides several benefits:

1. **Consistency**: All pages share the same header and footer
2. **DRY Principle**: Common elements are defined once and reused
3. **Separation of Concerns**: Content is separated from presentation
4. **Ease of Updates**: Changes to common elements only need to be made in one place
5. **Scalability**: Easy to add new pages without duplicating code

## Next Steps

After completing Phase 6, the next phase will be:

- Phase 7: Analytics and metadata implementation 