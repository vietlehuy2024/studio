export interface OmoCashflowData {
  date: string;
  OMO: number;
  "T-Repo": number;
  "T-Bill": number;
  "OMO+T-Repo": number;
  "OMO+T-Repo+T-Bill": number;
  "OMO-CUM": number;
  "T-Repo-CUM": number;
  "T-Bill-CUM": number;
  "OMO+T-Repo-CUM": number;
  "OMO+T-Repo+T-Bill-CUM": number;
}
