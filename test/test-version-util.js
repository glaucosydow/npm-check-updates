var versionUtil = require("../lib/version-util");
var chai = require("chai");
var should = chai.should();
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

describe('version-util', function () {

    describe('numParts', function() {
        it('should count the number of parts in a version', function() {
            versionUtil.numParts('1').should.equal(1);
            versionUtil.numParts('1.2').should.equal(2);
            versionUtil.numParts('1.2.3').should.equal(3);
            versionUtil.numParts('1.2.3-alpha.1').should.equal(4);
            versionUtil.numParts('1.2.3+build12345').should.equal(4);
        });
    });

    describe('getPrecision', function() {

        it('should detect versions as precise as "major"', function() {
            versionUtil.getPrecision('1').should.equal('major');
        });

        it('should detect versions as precise as "minor"', function() {
            versionUtil.getPrecision('1.2').should.equal('minor');
        });

        it('should detect versions as precise as "patch"', function() {
            versionUtil.getPrecision('1.2.3').should.equal('patch');
        });

        it('should detect versions as precise as "release"', function() {
            versionUtil.getPrecision('1.2.3-alpha.1').should.equal('release');
        });

        it('should detect versions as precise as "build"', function() {
            versionUtil.getPrecision('1.2.3+build12345').should.equal('build');
        });

    });

    describe('stringify', function() {

        it('should build a version string of the given parts', function() {

            versionUtil.stringify({major: '1'}).should.equal('1');

            versionUtil.stringify({
                major: '1',
                minor: '2'
            }).should.equal('1.2');

            versionUtil.stringify({
                major: '1',
                minor: '2',
                patch: '3'
            }).should.equal('1.2.3');

            versionUtil.stringify({
                major: '1',
                minor: '2',
                patch: '3',
                release: 'alpha.1'
            }).should.equal('1.2.3-alpha.1');

            versionUtil.stringify({
                major: '1',
                minor: '2',
                patch: '3',
                build: 'build12345'
            }).should.equal('1.2.3+build12345');

        });

        it('should pad the version with an optional precison argument', function() {
            
            versionUtil.stringify({major: '1'}, 'minor').should.equal('1.0');
            versionUtil.stringify({major: '1'}, 'patch').should.equal('1.0.0');
        });

        it('should truncate the version when a precision is provided', function() {
            versionUtil.stringify({
                major: '1',
                minor: '2',
                patch: '3',
                build: 'build12345'
            }, 'patch').should.equal('1.2.3');
            versionUtil.stringify({
                major: '1',
                minor: '2',
                patch: '3',
                build: 'build12345'
            }, 'minor').should.equal('1.2');
            versionUtil.stringify({
                major: '1',
                minor: '2',
                patch: '3',
                build: 'build12345'
            }, 'major').should.equal('1');
        });

    });

    describe('setPrecision', function() {

        it('should set the precision of a version at "major"', function() {
            versionUtil.setPrecision('1.2.3-alpha.1', 'major').should.equal('1');
        });

        it('should set the precision of a version at "minor"', function() {
            versionUtil.setPrecision('1.2.3-alpha.1', 'minor').should.equal('1.2');
        });

        it('should add 0 to minor if needed', function() {
            versionUtil.setPrecision('1', 'minor').should.equal('1.0');
        });

        it('should set the precision of a version at "patch"', function() {
            versionUtil.setPrecision('1.2.3-alpha.1', 'patch').should.equal('1.2.3');
        });

        it('should add 0 to patch if needed', function() {
            versionUtil.setPrecision('1', 'patch').should.equal('1.0.0');
        });

        it('should set the precision of a version at "release"', function() {
            versionUtil.setPrecision('1.2.3-alpha.1', 'release').should.equal('1.2.3-alpha.1');
        });

        it('should set the precision of a version at "build"', function() {
            versionUtil.setPrecision('1.2.3+build12345', 'build').should.equal('1.2.3+build12345');
        });

    });

    describe('precisionAdd', function() {
        it('should handle precision increase/decrease of base precisions', function() {
            versionUtil.precisionAdd('major', 0).should.equal('major');
            versionUtil.precisionAdd('major', 1).should.equal('minor');
            versionUtil.precisionAdd('major', 2).should.equal('patch');
            versionUtil.precisionAdd('minor', -1).should.equal('major');
            versionUtil.precisionAdd('minor', 0).should.equal('minor');
            versionUtil.precisionAdd('minor', 1).should.equal('patch');
            versionUtil.precisionAdd('patch', -2).should.equal('major');
            versionUtil.precisionAdd('patch', -1).should.equal('minor');
            versionUtil.precisionAdd('patch', 0).should.equal('patch');
        });

        it('should handle precision decrease of added precisions (release, build)', function() {
            versionUtil.precisionAdd('build', -1).should.equal('patch');
            versionUtil.precisionAdd('build', -2).should.equal('minor');
            versionUtil.precisionAdd('build', -3).should.equal('major');
            versionUtil.precisionAdd('release', -1).should.equal('patch');
            versionUtil.precisionAdd('release', -2).should.equal('minor');
            versionUtil.precisionAdd('release', -3).should.equal('major');
        });
    });

    describe('addWildCard', function() {
        it('should add ~', function() {
            versionUtil.addWildCard('1', '~').should.equal('~1');
            versionUtil.addWildCard('1.2', '~').should.equal('~1.2');
            versionUtil.addWildCard('1.2.3', '~').should.equal('~1.2.3');
            versionUtil.addWildCard('1.2.3-alpha.1', '~').should.equal('~1.2.3-alpha.1');
            versionUtil.addWildCard('1.2.3+build12345', '~').should.equal('~1.2.3+build12345');
        });
        it('should add ^', function() {
            versionUtil.addWildCard('1', '^').should.equal('^1');
            versionUtil.addWildCard('1.2', '^').should.equal('^1.2');
            versionUtil.addWildCard('1.2.3', '^').should.equal('^1.2.3');
            versionUtil.addWildCard('1.2.3-alpha.1', '^').should.equal('^1.2.3-alpha.1');
            versionUtil.addWildCard('1.2.3+build12345', '^').should.equal('^1.2.3+build12345');
        });
        it('should add .*', function() {
            versionUtil.addWildCard('1', '.*').should.equal('1.*');
            versionUtil.addWildCard('1.2', '.*').should.equal('1.*');
            versionUtil.addWildCard('1.2.3', '.*').should.equal('1.*');
            versionUtil.addWildCard('1.2.3-alpha.1', '.*').should.equal('1.*');
            versionUtil.addWildCard('1.2.3+build12345', '.*').should.equal('1.*');
        });
        it('should add .x', function() {
            versionUtil.addWildCard('1', '.x').should.equal('1.x');
            versionUtil.addWildCard('1.2', '.x').should.equal('1.x');
            versionUtil.addWildCard('1.2.3', '.x').should.equal('1.x');
            versionUtil.addWildCard('1.2.3-alpha.1', '.x').should.equal('1.x');
            versionUtil.addWildCard('1.2.3+build12345', '.x').should.equal('1.x');
        });
    });

});