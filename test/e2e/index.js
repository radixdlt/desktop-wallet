var Application = require('spectron').Application
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
var path = require('path')

chai.should()
chai.use(chaiAsPromised)

describe('application launch', function () {
    this.timeout(5000);

    beforeEach(function () {
        this.app = new Application({
            path: `${__dirname}/../../node_modules/.bin/electron`,
            args: [`${__dirname}/../..`]
        })
        return this.app.start()
    })

    beforeEach(function () {
        chaiAsPromised.transferPromiseness = this.app.transferPromiseness
    })

    afterEach(function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop()
        }
    })

    it('opens a window', function () {
        return this.app.client.waitUntilWindowLoaded(timeout(5000))
            .getWindowCount().should.eventually.equal(2)
            .browserWindow.isMinimized().should.eventually.be.false
            .browserWindow.isDevToolsOpened().should.eventually.be.false
            .browserWindow.isVisible().should.eventually.be.true
            .browserWindow.isFocused().should.eventually.be.true
            .browserWindow.getBounds().should.eventually.have.property('width').and.be.above(0)
            .browserWindow.getBounds().should.eventually.have.property('height').and.be.above(0)
            .getText('h1').should.eventually.equal('Hi There');
    })
})
