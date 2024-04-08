import { ExtensionSearchMeta } from 'chrome-extension-meta';
export type NpmFetchResponse = {
  success: true,
  error: null,
  number: 10,
  data: ExtensionSearchMeta[]

}

// export type ExtensionMeta = {
//   id: string
//   iconURL: string
//   title: string
//   rating: string
//   reviewCount: string
//   coverURL: string
//   description: string
// }

// export type ExtensionFullDetail = ExtensionMeta & {
//   detailedDescription: string;
//   additionalImages: string[];
//   version: string;
//   offeredBy: string;
//   updated: string;
//   size: string;
//   languages: string;
//   email: string;
//   websiteUrl: string;
//   privacyPolicyUrl: string;
// };


export type SearchFilter = {

  index: number,
  title: string,
  minRate: string,
}