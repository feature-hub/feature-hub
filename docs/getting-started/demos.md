---
id: demos
title: Demos
sidebar_label: Demos
---

There are two locations where demos can be found, the
[`@feature-hub/demos`][demos-package] package in the Feature Hub monorepo, and
the [Feature Hub organization][github-org] on GitHub.

## TodoMVC Live Demo

> See the TodoMVC Demo in action at
> [feature-hub.io/todomvc/][todomvc-live-demo].

The [TodoMVC demo][todomvc-demo-src] is a partial implementation of the [TodoMVC
project][todomvc.com]. Although micro frontends wouldn't and shouldn't really be
used for such a small web application, this still demonstrates how a web
application can be composed of multiple Feature Apps that share state through
Feature Services.

In this case the app is sliced into three Feature Apps that are deployed
independently, and a single Feature Service:

- [The "header" Feature App][todomvc-demo-src-header] is a DOM Feature App with
  an external CSS file. It provides the functionality for creating a new todo.
- [The "main" Feature App][todomvc-demo-src-main] is a React Feature App with
  CSS Modules. It displays the todos, and provides the functionality for
  deleting todos and marking them as complete.
- [The "footer" Feature App][todomvc-demo-src-footer] is a React Feature App
  with Styled Components. It displays how many uncompleted todos are left, and
  provides the functionality for removing all completed todos from the list.
- [The "todo manager" Feature Service][todomvc-demo-src-todo-manager] stores the
  todos, and provides methods to the three consuming Feature Apps for reading
  and modifying the todos.

[demos-package]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos
[todomvc-demo-src]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/todomvc
[todomvc-demo-src-header]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/todomvc/header
[todomvc-demo-src-main]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/todomvc/main
[todomvc-demo-src-footer]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/todomvc/footer
[todomvc-demo-src-todo-manager]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/todomvc/todo-manager
[github-org]: https://github.com/feature-hub
[todomvc.com]: http://todomvc.com
[todomvc-live-demo]: /todomvc/
