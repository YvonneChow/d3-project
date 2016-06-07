Glytec Glucommander
==========

###Purpose
o  Serve as a playground for trying out different charting types
o  Prototyping screens and components
o  Compose a style guide

The pieces and parts (css, js) that exist as of now are mainly for composing the style guide. We want to keep some amount of separation while we play around and prototype some different ideas. Create more parent scss/css and partials so that we can keep things separate for now and then easily import styles into the master and guide.

###Get running

1. Download a zip of this repo to start your style guide project and extract it to your project repo.
2. If you don't have it already, install node.js, and make sure it's added to your system path. https://nodejs.org/en/
3. Open this directory in a shell
4. Type npm install, and the tools listed in the package.json will be installed your project. This package includes:
	- "express": "^4.13.3",
	- "grunt": "^0.4.5",
	- "grunt-concurrent": "^2.0.3",
	- "grunt-contrib-watch": "^0.6.1",
	- "grunt-sass": "^1.0.0",
	- "jit-grunt": "^0.9.1",
	- "load-grunt-config": "^0.17.2",
	- "ssi": "^0.3.0",
	- "time-grunt": "^1.2.1"
5. Before your first commit, add node_modules/* and .sass-cache/* to your.gitignore file
6. Now you're ready to start your project. Open two shells, and type 'node server' in one, and 'grunt' in the other. 'Node server' will allow you to view your site at 'http://localhost:1337/'. 'Grunt' will watch your scss directory for changes.

This guide gives you two main css files. One is to use for the guide with some extra styles for the guide or styles that would otherwise be covered by the client's code (and is thus unnecessary to include in the final css we send them). The css file to make sure clients refer or use is the goinvo-app.css. We can also provide them with the sass or less, but the goinvo-app.css file ends up being all the styles that have been defined in the design.