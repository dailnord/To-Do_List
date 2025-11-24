# ToDoListApp: instructions to Run the Application Locally

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.11. and .NET Core 9

## Prerequisites

Node.js and npm: Node 16+ or 18+ recommended. Check your versions with:

```bash
node -v
npm -v
```
Git: Required to clone the repository.

```bash
git clone https://github.com/USER/REPO.git
cd REPO
```
## Install dependencies

```bash
npm install
```
If installation fails:

```bash
rd /s /q node_modules
del package-lock.json
npm install

```
## Development server
To start a local development server, run:

```bash
npm run dev
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

Prerequisites for end-to-end (e2e) testing: Always run the application first with ```npm run dev``` and when it is available run:

```bash
npx cypress open
```
This opens the Cypress graphical interface where you can:
- View all available tests
- Run tests individually
- View real-time executions
- Perform visual debugging

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# To-Do_List

