// novel/src/en/allnovel.js

const mangayomiSources = [
  {
    "name": "AllNovel",
    "id": 987654321, // pick a unique random number
    "baseUrl": "https://allnovel.org",
    "lang": "en",
    "typeSource": "single",
    "iconUrl": "https://www.google.com/s2/favicons?sz=256&domain=https://allnovel.org/",
    "dateFormat": "",
    "dateFormatLocale": "",
    "isNsfw": false,
    "hasCloudflare": false,
    "sourceCodeUrl": "",
    "apiUrl": "",
    "version": "0.0.1",
    "isManga": false,
    "itemType": 2,
    "isFullData": false,
    "appMinVerReq": "0.5.0",
    "additionalParams": "",
    "sourceCodeLanguage": 1,
    "notes": "",
    "pkgPath": "novel/src/en/allnovel.js"
  },
];

class AllNovelExtension extends MProvider {
  constructor() {
    super();
    this.client = new Client();
  }

  async request(slug) {
    const url = `${this.source.baseUrl}${slug}`;
    const body = (await this.client.get(url)).body;
    return new Document(body);
  }

  async searchPage({ query = "", page = 1 } = {}) {
    const slug = `/search?keyword=${encodeURIComponent(query)}&page=${page}`;
    const doc = await this.request(slug);

    const list = [];
    doc.select(".c-tabs-item__content").forEach((item) => {
      const link = item.selectFirst("a").getHref;
      const name = item.selectFirst("a").attr("title");
      const imageUrl = item.selectFirst("img").attr("src");
      list.push({ name, link, imageUrl });
    });

    const hasNextPage = doc.selectFirst(".PagedList-skipToNext") !== null;

    return { list, hasNextPage };
  }

  async getPopular(page) {
    return await this.searchPage({ page });
  }

  async getLatestUpdates(page) {
    return await this.searchPage({ page });
  }

  async search(query, page, filters) {
    return await this.searchPage({ query, page });
  }

  async getDetail(url) {
    const slug = url.replace(this.source.baseUrl, "");
    const doc = await this.request(slug);

    const name = doc.selectFirst(".post-title h1").text;
    const imageUrl = doc.selectFirst(".summary_image img").attr("src");
    const description = doc.selectFirst(".summary__content").text.trim();

    const genre = [];
    doc.select(".genres a").forEach((a) => genre.push(a.text.trim()));

    let status = 5;
    const statusText = doc.selectFirst(".post-status .summary-content").text;
    if (statusText.includes("Ongoing")) status = 0;
    if (statusText.includes("Completed")) status = 1;

    const chapters = [];
    doc.select("#chapterlist li a").forEach((a) => {
      const chapLink = a.getHref;
      const chapName = a.text.trim();
      chapters.push({
        name: chapName,
        url: chapLink,
        dateUpload: "", // could parse if dates available
      });
    });

    return {
      name,
      imageUrl,
      description,
      link: url,
      status,
      genre,
      chapters,
    };
  }

  async getHtmlContent(name, url) {
    const doc = await this.request(url.replace(this.source.baseUrl, ""));
    return this.cleanHtmlContent(doc);
  }

  async cleanHtmlContent(doc) {
    const contentNodes = doc.select(".text-left p, .chapter-content p");
    let content = "";
    contentNodes.forEach((p) => {
      content += p.text.trim() + "<br>";
    });
    return content;
  }

  getFilterList() {
    // Basic filters only, could be expanded if needed
    return [];
  }

  getSourcePreferences() {
    throw new Error("getSourcePreferences not implemented");
  }
}

