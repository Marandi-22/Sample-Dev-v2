// services/feedService.js
import axios from "axios";
import * as rssParser from "react-native-rss-parser";

export const getFeedPosts = async () => {
  try {
    const rssUrl =
      "https://news.google.com/rss/search?q=scam+OR+fraud&hl=en-IN&gl=IN&ceid=IN:en";
    const response = await axios.get(rssUrl);
    const rss = await rssParser.parse(response.data);

    // Convert RSS to our FeedCard format
    return rss.items.map((item, index) => ({
      id: index + 1,
      title: item.title,
      description: item.description?.replace(/<[^>]+>/g, ""), // remove HTML tags
      image:
        item.enclosures?.[0]?.url ||
        "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg",
      category: "Scams",
      link: item.links[0].url,
    }));
  } catch (error) {
    console.error("Error fetching scam news:", error);
    return [];
  }
};