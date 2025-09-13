// novel/src/en/allnovel.js

class AllNovel extends MProvider {
  constructor() {
    super();
    this.client = new Client();
  }

  async request(slug) {
    const url = `${this.source.baseUrl}${slug}`;
    const body = (await this.client.get(url)).body;
    return new Document(body);
  }

  async search(query, page) {
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
      chapters.push({ name: chapName, url: chapLink });
    });

    return { name, imageUrl, description, link: url, status, genre, chapters };
  }

  async getHtmlContent(name, url) {
    const doc = await this.request(url.replace(this.source.baseUrl, ""));
    const contentNodes = doc.select(".text-left p, .chapter-content p");
    let content = "";
    contentNodes.forEach((p) => {
      content += p.text.trim() + "<br>";
    });
    return content;
  }
}

export default AllNovel;
