// @TODO: Allow changing the network name and url per user requirement, not from the env file
export enum Social {
    GOOGLE = 'google',
    TWITTER = 'twitter',
    DISCORD = 'discord',
}
  
export const getSVGPath = (socialProvider: string) => {
    switch (socialProvider) {
        case Social.GOOGLE:
        return '/google.svg';
        case Social.TWITTER:
        return '/twitter.svg';
        case Social.DISCORD:
        return `/discord.svg`;
        default:
        throw new Error('Social Provider not supported');
    }
};

export function capitalize(str: string) {
    if (!str) return str; 
    return str.charAt(0).toUpperCase() + str.slice(1);
};

  