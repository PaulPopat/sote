SOTE (Static Only Templating Engine) Is a tool to help you build simple HTML sites with some of the bonuses of modern JavaScript frameworks.

# Why

I love modern JavaScript frameworks. I use them all the time and will continue to use them all the time. What I wanted was to get some of the benefit of the component syntax and the way that data as passed down the page but will a much simpler boilerplate and setup for simple applications. I imagine this being used for simple static sites and basic interaction.

This tool is not a replacement for the more advanced frameworks (React, VueJS, Angular, etc). It will never provide the flexibility and power that they offer.

# Setup

It should be as simple as running `npm install @paulpopat/sote`

The command `sote` will run the program with default settings. By default, the app will look for pages in the `./src/pages` directory. It will look for a `.tpe` file and a `.js` file for each page. The `.js` file should have an exported function for each support HTTP method (all lower case). These functions should be async and return an object with the schema `{ status: number, headers?: { [key: string]: string } }, data: any}`. The `.tpe` file should follow the format described below. If the `.js` file is not present, a simple get method will be generated and no data will be provided to the `.tpe` file.

Components will be taken from `./src/component`. The components are then given a name by taking the path from the components route, in lower case, and with slashes swapped for spaces. E.G. `./src/component/my/test.tpe` would be called as `<my-test></my-test>`.

The layout will accessed as `./src/layout.html`. This file should contain a tag called `BODY_CONTENT`, which will be replaced with the body content for the page being loaded.

The error page will be listed as `{pages_dir}/_error.tpe`. This will be loaded instead of the page file if the page function returns a status above 399. The error page will have access to the data returned from the function, so try to provide good error information for the user.

The app can be customised with various command line parameters.

```
--components="The path to the components directory"
--pages="The path to the pages directory"
--layout="The path to the layout .html file"
--port="The port that the app will listen on (default is 3000)"
--static="The path to any static files. These files will then be accessable under the _ subdirectory. E.G. /_/image.png"
--error_page="The path to the error page .tpe file"
--sass="The path to the index sass file, if available. If this option is set then the rendered css will be available at /renderd-sass.css"
```

## Config file

Options can also be loaded from a config JSON file. The app will look for `./tpe-config.json` at the root of the project. This file contains the same parameters as the command line but with no `--` at the begining. An array of component directories is supported, for if you want to import component libraries.

```JSON
{
  "components": ["./test-data/components", "./test-data/other-components"],
  "pages": "./test-data/pages",
  "layout": "./test-data/layout.html",
  "sass": "./test-data/styles/index.scss",
  "static": "./test-data/public",
  "port": "3000",
  "error_page": "./test-data/error.tpe"
}
```

# Url structure

The Url structure will be generated as described as above. This is used in ExpressJs so using a colon at the start of a section in the path will turn it into a parameter. This parameter can accessed in the query parameter, supplied to the JavaScript files.

# Page JavaScript files

Page files should export a function for the desired method. That function can contain an argument for the query string and parameters (for all methods) and an argument for the body (for put, post, and patch only). The final argument will be provided with the headers for the request. An example of the file would be

```JavaScript
module.exports = {
  get: async (query, headers) => {
    return {
      status: 200,
      headers: { "x-count": "50" },
      data: [1, 2, 3, 4, 5]
    }
  },
  post: (query, body, headers) => {
    return {
      status: 200,
      headers: { "x-count": "50" },
      data: [1, 2, 3, 4, 5]
    }
  }
}
```

## Food for thought

For complex files, why not compile some TypeScript or other down. Just remember that the files need to line up with the TPE files.

# TPE files

TPE files should look like an inhanced HTML. See the `test-data` in this repository for examples. Data that is passed into the pages, from the JavaScript files, can be accessed in the HTML text by using `{props.variable_name}`. It can also be passed into HTML attributes with a colon at the start of attibute text `<p class=":props.data_classname"></p>`. Only strings and numbers can be used in this way, but using the `.` accessor is allowed.

TPE files also support components. They can be accessed in the way described above and complex JavaScript objects can be passed as attributes. Components can also have a `<CHILDREN></CHILDREN>` element in them. Any HTML that is put inside the call of that component will be placed where this element is.

```HTML
<!--paragraph.tpe-->
<p><CHILDREN></CHILDREN></p>

<!--page.tpe-->
<paragraph><b>Some cool</b> text</paragraph>

<!--Results in-->
<p><b>Some cool</b> text</p>
```

Looping can be achieved with `for` tag. This tag should be supplied with a `subject` attribute and a `key` attribute. The subject should be an array and the key should be a string. The key will be added to the props, to access the item in the array.

```HTML
<!-- test_data=[{name: "Paul Popat"}, {name: "John Doe"}]-->
<ul>
  <for subject=":props.test_data" key="item">
    <li>{item.name}</li>
  </for>
</ul>

<!--Results in-->
<ul>
  <li>Paul Popat</li>
  <li>John Doe</li>
</ul>
```

Conditional elements are represented by the `if` tag. This tag should be supplied with a `check` attribute. The check must be a boolean and will result in a page error, if it is not.

```HTML
<!-- check_one=true check_two=false -->
<if check=":props.check_one">
 <p>Hello</p>
</if>

<if check=":props.check_two">
 <p>world</p>
</if>

<!--Results in-->
<p>Hello</p>
```

# Expressions

Any variable accessors can be JavaScript expressions. These expressions are provided with the props and can access all standard libraries but will not be able to access anything else. It is worth noting that functions can be passed into the props.

# Maybe to come

- Component level Sass
