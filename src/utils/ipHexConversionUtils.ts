
/**
 * Converts an IP HEX string to V4 format.
 * @param ipHex Ip in HEX format
 */
export const ipvHexToV4 = (ipHex: string) => {
  const withoutPrefix = ipHex.slice(2);

  const part1 = ipHex.slice(2, 4);
  const part2 = ipHex.slice(4, 6);
  const part3 = ipHex.slice(6, 8);
  const part4 = ipHex.slice(8);
  const parts = [part1, part2, part3, part4];

  const toV4 = parts.map((ipHexPart) => parseInt(ipHexPart, 16)).join(".");

  return toV4;
};

/**
 * Converts an IP V4 string to hex format.
 * @param ipv4 Ip in V4 format
 */
export const ipv4ToHex = (ipv4: string) => {
  const manualToHex = ipv4
    .split(".")
    .map((ipSection) => parseInt(ipSection).toString(16).padStart(2, "0"))
    .join("");

  // Add the prefix
  const ipAsHex = `0x${manualToHex}`;

  return ipAsHex;
};
