# MCP Configuration

This file documents the Model Context Protocol (MCP) servers and tools available for this project.

run command /mcp see or connect to specific MCP servers

## Available MCP Servers

### Context7 MCP Server

- **Connection**: HTTP transport
- **URL**: `https://mcp.context7.com/mcp`
- **Status**: ✓ Connected
- **Purpose**: Access to comprehensive documentation libraries

## Context7 Tools

### resolve-library-id

Resolves a general library name into a Context7-compatible library ID.

- **Parameters**:
  - `libraryName` (required): The name of the library to search for

### get-library-docs

Fetches documentation for a library using a Context7-compatible library ID.

- **Parameters**:
  - `context7CompatibleLibraryID` (required): Exact Context7-compatible library ID
  - `topic` (optional): Focus the docs on a specific topic
  - `tokens` (optional, default 10000): Max number of tokens to return

## Available Shopify Documentation Libraries

### Core Documentation

- `/context7/shopify_dev` - **Primary documentation source** (106,629 snippets)
- `/llmstxt/shopify_dev-llms.txt` - Shopify Developer Platform (270 snippets)

### App Development

- `/shopify/cli` - Shopify CLI (386 snippets)
- `/shopify/shopify_app` - Shopify App Rails Engine (78 snippets)
- `/shopify/shopify-app-js` - Shopify App JS (435 snippets)
- `/shopify/shopify-app-template-remix` - Shopify App Template Remix (16 snippets)
- `/shopify/shopify-app-bridge` - Shopify App Bridge (0 snippets)

### APIs

- `/shopify/shopify-api-js` - Shopify Admin API Library for Node (231 snippets)
- `/shopify/shopify-api-php` - Shopify API PHP (22 snippets)
- `/shopify/shopify_python_api` - ShopifyAPI Python (30 snippets)
- `/bold-commerce/go-shopify` - Go client for Shopify API (18 snippets)

### UI & Extensions

- `/shopify/polaris` - Shopify Polaris Design System (1,116 snippets)
- `/context7/polaris-react_shopify` - Polaris React (613 snippets)
- `/shopify/ui-extensions` - Shopify UI Extensions (267 snippets)

### Storefronts

- `/shopify/hydrogen` - Hydrogen (634 snippets)
- `/shopify/storefront-api-learning-kit` - Storefront API Learning Kit (54 snippets)
- `/webcomponents.shopify.dev/llmstxt` - Storefront Web Components (209 snippets)

### Mobile

- `/shopify/mobile-buy-sdk-ios` - Mobile Buy SDK iOS (48 snippets)
- `/shopify/mobile-buy-sdk-android` - Mobile Buy SDK Android (42 snippets)

### Templates & Themes

- `/shopify/liquid` - Liquid markup language (160 snippets)
- `/shopify/theme-liquid-docs` - Theme Liquid reference (22 snippets)

### Third-party Integrations

- `/konkonam/nuxt-shopify` - Nuxt Shopify (24 snippets)
- `/kyon147/laravel-shopify` - Laravel Shopify (234 snippets)
- `/nestjs-shopify/nestjs-shopify` - NestJS Shopify (47 snippets)

### Utilities

- `/shopify/money` - Manage money in Shopify (29 snippets)
- `/shopify/roast` - Structured AI workflows (277 snippets)
- `/shopify/cli-ui` - CLI tooling framework (12 snippets)
- `/shopify/draggable` - JavaScript Drag & Drop library (125 snippets)
- `/shopify/flash-list` - Better list for React Native (205 snippets)
- `/shopify/react-native-skia` - High-performance React Native Graphics (237 snippets)
- `/shopify/react-native-performance` - Performance monitoring for React Native (54 snippets)

## Usage Guidelines

### For Cart Transform Functions

Use `/context7/shopify_dev` with topic "cart transform functions" to get the latest documentation on:

- Cart transformation API
- GraphQL schema for cart operations
- Function deployment and testing
- Bundle creation and pricing

### For General Shopify Development

Use `/context7/shopify_dev` for:

- API documentation and best practices
- GraphQL schema changes and deprecations
- Authentication patterns and scope requirements
- CLI commands and workflows

### Example Usage

```
mcp__context7__resolve-library-id with libraryName "Shopify"
mcp__context7__get-library-docs with context7CompatibleLibraryID "/context7/shopify_dev" and topic "cart transform"
```

## Verification Checklist

When using MCP tools to verify Shopify information:

- Always check if commands, APIs, or approaches are current or deprecated
- Prefer official Shopify documentation over web search results
- Verify latest best practices and recommended workflows
- Check for recent changes in Shopify CLI commands and app development patterns
