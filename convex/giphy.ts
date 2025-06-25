import { action } from './_generated/server';
import { v } from 'convex/values';

export const getRandomGif = action({
  args: { searchTerm: v.string() },
  handler: async (_, args) => {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_API_KEY}&tag=${args.searchTerm}`
    );
    const data = await response.json();

    return data.data.images.downsized_large.url;
  },
});
