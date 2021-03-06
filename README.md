# PTR Performance UI Template

This tool uses the Google Page Insights API to provide a page level report of production website front-end performance. Unlike most tools YUI etc, this tool can accept multiple page arguments.

## Local Setup

1) The tool requires that requests to the Google Page Insights API are made from localhost address so you will need to setup MAMP or similar to run from a local web server.
2) Also you will need to extract the bower_components.zip and run "compass watch" from the performance-tool directory. As soon as you make a save on any scss file within the performance-tool/scss directory this will generate the css file required

# Foundation Compass Template

The easiest way to get started with Foundation + Compass.

## Requirements

  * Ruby 1.9+
  * [Node.js](http://nodejs.org)
  * [compass](http://compass-style.org/): `gem install compass`
  * [bower](http://bower.io): `npm install bower -g`

## Quickstart

  * [Download this starter compass project and unzip it](https://github.com/zurb/foundation-compass-template/archive/master.zip)
  * Run `bower install` to install the latest version of Foundation
  
Then when you're working on your project, just run the following command:

```bash
bundle exec compass watch
```

## Upgrading

If you'd like to upgrade to a newer version of Foundation down the road just run:

```bash
bower update
```
