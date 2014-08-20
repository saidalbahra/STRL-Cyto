module.exports = function(grunt) {

  // Load node-modules;
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-text-replace");
  grunt.loadNpmTasks("grunt-shell");

  // Get option `pre` on bump command
  var isPre = grunt.option("pre") ? true : false;

  var bumpVersion = function(version,level) {
    version = version.split(".") || [0,0,0];
    level = level || 2;
    version[level]++;
    return version.join(".")+(isPre ? "-pre" : "");
  };

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    jshint: {
      main: ["<%= pkg.main %>","Gruntfile.js"],
      options: {
        jshintrc: true
      }
    },
    shell: {
      pushBump: {
          command: [
            "git add www/index.html www/config.xml package.json",
            "git commit -m 'Base: Increment version number'",
            "git push"
          ].join("&&")
      }
    },
    replace: {
      index: {
      phonegap: {
        src: ["www/config.xml"],
        overwrite: true,
        replacements: [{
          from: /version     = "([\d|\.]+)(-pre)?"/g,
          to: function(matchedWord, index, fullText, regexMatches){
            if (regexMatches[1]) {
              return "version     = \""+regexMatches[0]+(isPre ? "-pre" : "")+"\"";
            } else {
              return "version     = \""+bumpVersion(regexMatches[0])+"\"";
            }
          }
        },{
          from: /versionCode = "(\d+)"/g,
          to: function(matchedWord, index, fullText, regexMatches) {
            if (isPre) {
              return "versionCode = \""+parseInt(regexMatches[0])+"\"";
            } else {
              return "versionCode = \""+(parseInt(regexMatches[0])+1)+"\"";
            }
          }
        }]
      },
      manifests: {
        src: ["package.json"],
        overwrite: true,
        replacements: [{
          from: /"version": "([\d|\.]+)(-pre)?"/g,
          to: function(matchedWord, index, fullText, regexMatches){
            if (regexMatches[1]) {
              return "\"version\": \""+regexMatches[0]+(isPre ? "-pre" : "")+"\"";
            } else {
              return "\"version\": \""+bumpVersion(regexMatches[0])+"\"";
            }
          }
        }]
      }
    }
  });

  // Default task(s).
  grunt.registerTask("default",["jshint"]);
  grunt.registerTask("bump",["replace","shell:pushBump"]);

};
