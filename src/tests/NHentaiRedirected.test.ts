import cheerio from 'cheerio'
import { NHentaiRedirected } from "../NHentaiRedirected/NHentaiRedirected";
import { APIWrapper, Source } from 'paperback-extensions-common';

describe('N-Hentai Redirector Tests', function () {

    var wrapper: APIWrapper = new APIWrapper();
    var source: Source = new NHentaiRedirected(cheerio);
    var chai = require('chai'), expect = chai.expect, should = chai.should();
    var chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);

    /**
     * The Manga ID which this unit test uses to base it's details off of.
     * Try to choose a manga which is updated frequently, so that the historical checking test can 
     * return proper results, as it is limited to searching 30 days back due to extremely long processing times otherwise.
     */
    var hentaiId = "318842";

    it("Retrieve Manga Details", async () => {
        let details = await wrapper.getMangaDetails(source, [hentaiId]);
        expect(details, "No results found with test-defined ID [" + hentaiId + "]").to.be.an('array');
        expect(details).to.not.have.lengthOf(0, "Empty response from server");

        // Validate that the fields are filled - Note that there are no artists on Manganelo that I can tell
        let data = details[0];
        expect(data.id, "Missing ID").to.be.not.empty;
        expect(data.image, "Missing Image").to.be.not.empty;
        expect(data.artist, "Missing Artist").to.be.not.empty;
        expect(data.hentai, "Missing Hentai").to.exist
    });

    it("Get Chapters", async () => {
        let data = await wrapper.getChapters(source, hentaiId);
        expect(data, "No chapters present for: [" + hentaiId + "]").to.not.be.empty;
    });

    it("Get Chapter Details", async () => {

        let chapters = await wrapper.getChapters(source, hentaiId);
        let data = await wrapper.getChapterDetails(source, hentaiId, chapters[0].id);

        expect(data, "No server response").to.exist;
        expect(data, "Empty server response").to.not.be.empty;

        expect(data.id, "Missing ID").to.be.not.empty;
        expect(data.mangaId, "Missing hentaiId").to.be.not.empty;
        expect(data.pages, "No pages present").to.be.not.empty;
    });

    it("Searching for Manga With A Valid six-digit query", async () => {
        let testSearch = createSearchRequest({
            title: '312483',
        });

        let search = await wrapper.search(source, testSearch, 1);
        let result = search[0];
        expect(result).to.exist

        expect(result.id).to.exist
        expect(result.image).to.exist
        expect(result.title).to.exist
    });

    it("Searching for Manga With A Valid five-digit query", async () => {
        let testSearch = createSearchRequest({
            title: '98125',
        });

        let search = await wrapper.search(source, testSearch, 1);
        let result = search[0];
        expect(result).to.exist

        expect(result.id).to.exist
        expect(result.image).to.exist
        expect(result.title).to.exist
    });

    it("Searching for Manga With an invalid six-digit query", async () => {
        let testSearch = createSearchRequest({
            title: '999999',
        });

        let search = await wrapper.search(source, testSearch, 1);
        let result = search[0];
        expect(result).to.not.exist;    // There should be no entries with this tag!
    });

    it("Searching with Hentai settings disabled", async() => {
        let testSearch = createSearchRequest({
            title: "Women",
            hStatus: false
        })

        let search = await wrapper.search(source, testSearch, 1)
        expect(search).to.be.empty
    })


    it("Retrieve Home Page Sections", async () => {

        let data = await wrapper.getHomePageSections(source);
        expect(data, "No response from server").to.exist;
        expect(data, "No response from server").to.be.not.empty;

        let newHentai = data[0];
        expect(newHentai.id, "Popular Titles ID does not exist").to.not.be.empty;
        expect(newHentai.title, "Popular manga section does not exist").to.not.be.empty;
        expect(newHentai.items, "No items available for popular titles").to.not.be.empty;
    });

    
});