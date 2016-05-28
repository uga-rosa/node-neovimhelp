const {expect} = require("chai");
const rewire = require("rewire");
const VIMHELP = rewire("../lib/vimhelp");
const {VimHelp} = VIMHELP;

describe("vimhelp", () => {
  describe("VimHelp", () => {
    let vimhelp;
    beforeEach(() => {
      vimhelp = new VimHelp();
    });
    describe(".search()", () => {
      it("returns Promise object", () => {
        expect(vimhelp.search("help")).to.be.instanceof(Promise);
      });
      it("searches help from Vim's document", (done) => {
        vimhelp.search("help").then((helpText) => {
          expect(helpText).to.include("*help*");
          done();
        }).catch(done);
      });
      context("when the help does not exist", () => {
        it("throws error", (done) => {
          vimhelp.search("never-never-exist-help").then((helpText) => {
            done(helpText);
          }).catch((error) => {
            expect(error.errorText).to.match(/^E149:/);
            done();
          }).catch(done);
        });
      });
      context("when rtp provider is set", () => {
        let revert;
        before(() => {
          revert = VIMHELP.__set__("execVim", (vimBin, commands) => commands);
        });
        after(() => {
          revert();
        });
        beforeEach(() => {
          vimhelp.setRTPProvider(() => ["/path/to/plugin"]);
        });
        it("is set rtp from provider", () => {
          let commands = vimhelp.search("word");
          expect(commands).to.include("set runtimepath+=/path/to/plugin");
        });
      });
    });

    describe(".setRTPProvider()", () => {
      let provider;
      beforeEach(() => {
        provider = () => ["/path/to/plugin"];
      });
      it("sets a rtp provider", () => {
        vimhelp.setRTPProvider(provider);
        expect(vimhelp.rtpProvider).to.eql(provider);
      });
    });
  });
});
