import web3 from "web3";

export function fullOrbsFromWeiOrbs(weiOrbsString: string): number {
  return parseInt(web3.utils.fromWei(weiOrbsString, "ether"));
}

export function weiOrbsFromFullOrbs(fullOrbs: number): bigint {
  return BigInt(web3.utils.toWei(fullOrbs.toString(), "ether"));
}
