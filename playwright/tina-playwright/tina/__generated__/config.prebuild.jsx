// tina/config.js
import { defineConfig } from "tinacms";

// tina/collections/page.js
var page_default = {
  label: "Page Content",
  name: "page",
  path: "content/page",
  format: "mdx",
  fields: [
    {
      name: "body",
      label: "Main Content",
      type: "rich-text",
      isBody: true
    }
  ],
  ui: {
    router: ({ document }) => {
      if (document._sys.filename === "home") {
        return `/`;
      }
      return void 0;
    }
  }
};

// tina/collections/post.js
var post_default = {
  label: "Blog Posts",
  name: "post",
  path: "content/post",
  indexes: [
    {
      name: "title",
      fields: [{ name: "title" }]
    }
  ],
  fields: [
    {
      type: "string",
      label: "Title",
      name: "title",
      searchable: true
    },
    {
      type: "string",
      label: "Blog Post Body",
      name: "body",
      isBody: true,
      ui: {
        component: "textarea"
      }
    }
  ],
  ui: {
    router: ({ document }) => {
      return `/posts/${document._sys.filename}`;
    }
  }
};

// tina/collections/author.js
var author_default = {
  label: "Author",
  name: "author",
  path: "content/author",
  format: "mdx",
  fields: [
    {
      name: "Title",
      type: "string"
    }
  ]
};

// tina/collections/settings.js
var settings_default = {
  label: "Settings",
  name: "settings",
  path: "content/settings",
  format: "json",
  fields: [
    {
      name: "label",
      type: "string"
    }
  ]
};

// tina/config.js
var config = defineConfig({
  branch: "",
  clientId: "",
  token: "",
  telemetry: "anonymous",
  build: {
    publicFolder: "public",
    // The public asset folder for your framework
    outputFolder: "admin"
    // within the public folder
  },
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "uploads"
    }
  },
  schema: {
    collections: [page_default, post_default, author_default, settings_default]
  },
  search: {
    tina: {}
  }
});
var config_default = config;
export {
  config,
  config_default as default
};
