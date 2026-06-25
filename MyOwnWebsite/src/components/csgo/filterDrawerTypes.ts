export interface CsgoFilterOption {
  label: string;
  value: string;
}

export interface CsgoFilterSection {
  title: string;
  options: CsgoFilterOption[];
}

export interface CsgoFilterGroup {
  name: string;
  sections: CsgoFilterSection[];
}

export type CsgoFilterValues = Record<string, string[]>;
