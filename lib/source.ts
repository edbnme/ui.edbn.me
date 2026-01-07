// =============================================================================
// PAGE TREE TYPES
// =============================================================================

export type PageTreeItem =
  | { type: "separator"; name: string }
  | { type: "page"; name: string; url: string; icon?: string };

export interface PageTree {
  name: string;
  children: PageTreeItem[];
}

// =============================================================================
// PAGE TREE STRUCTURE
// =============================================================================

/**
 * Documentation sidebar navigation tree
 * Defines the hierarchical structure of documentation pages
 */
export const pageTree: PageTree = {
  name: "Docs",
  children: [
    {
      type: "separator",
      name: "Get Started",
    },
    {
      type: "page",
      name: "Welcome",
      url: "/docs",
    },
    {
      type: "page",
      name: "Changelog",
      url: "/docs/changelog",
    },
    {
      type: "page",
      name: "License",
      url: "/docs/license",
    },
    {
      type: "page",
      name: "Overview",
      url: "/docs/components",
    },
    {
      type: "separator",
      name: "Components",
    },
    {
      type: "page",
      name: "Button",
      url: "/docs/components/buttons",
    },
    {
      type: "page",
      name: "Alert Dialog",
      url: "/docs/components/alert-dialog",
    },
    {
      type: "page",
      name: "Popover",
      url: "/docs/components/popover",
    },
    {
      type: "page",
      name: "Dropdown Menu",
      url: "/docs/components/dropdown-menu",
    },
    {
      type: "separator",
      name: "Motion",
    },
    {
      type: "page",
      name: "Motion Provider",
      url: "/docs/utilities/motion-provider",
    },
    {
      type: "page",
      name: "Spring Presets",
      url: "/docs/utilities/motion",
    },
    {
      type: "page",
      name: "Hooks",
      url: "/docs/utilities/hooks",
    },
  ],
};

export const source = {
  pageTree,
};
