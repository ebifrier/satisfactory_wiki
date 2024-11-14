import { CSSProperties } from "react";
import _ from "lodash";
import { TRecipe, TBuilding, TItem } from "@/index";

export interface TTag {
  type: string;
}

export interface TTextTag extends TTag {
  content: string;
  size?: number;
}

export interface TImageTag extends TTag {
  refer: string;
  size?: number;
}

export interface TLinkTag extends TTag {
  link: string;
  labelTags: (TTag | string)[];
}

export class TagUtil {
  static isTextTag = (tag: TTag): tag is TTextTag => tag.type === "text";
  static isImageTag = (tag: TTag): tag is TImageTag => tag.type === "image";
  static isLinkTag = (tag: TTag): tag is TLinkTag => tag.type === "link";

  static getImageTag = (wikiId: string, size?: number): TImageTag => ({
    type: "image",
    refer: `${wikiId}.png`,
    size,
  });

  static getLink = (label: string, link: string): TLinkTag => ({
    type: "link",
    link,
    labelTags: [label],
  });

  static getImageLink = (
    label: string,
    link: string,
    wikiId: string,
    size?: number
  ): TLinkTag => {
    const imageTag = this.getImageTag(wikiId, size);
    return {
      type: "link",
      link,
      labelTags: [imageTag, label],
    };
  };

  static getSmallImageLink = (item: TRecipe | TBuilding | TItem): TLinkTag => {
    return this.getImageLink(item.name, item.wikiLink, item.wikiId);
  };

  static getBuildingLink = (building: TBuilding): TLinkTag =>
    this.getImageLink(
      `&br;${building.name}`,
      building.wikiLink,
      building.wikiId
    );

  static getConditionLink = (recipe: TRecipe): (TTag | string)[] => {
    if (recipe.alternate) {
      return ["分析[ ", this.getLink("ハードドライブ", "代替レシピ"), " ]"];
    }

    const { condition } = recipe;
    if (!condition) {
      return [];
    }

    const { kind, name, wikiLink, tier, category } = condition;
    switch (kind) {
      case "onboarding":
        return ["[ 初期から開放済み ]"];
      case "milestone":
        const label1 = `ティア${tier}:${name}`;
        return ["マイルストーン[ ", this.getLink(label1, wikiLink), " ]"];
      case "research":
        const label2 = `${category}:${name}`;
        return ["分析[ ", this.getLink(label2, wikiLink), " ]"];
      default:
        return [];
    }
  };

  static amountToStr = (amount?: number): string | undefined =>
    amount != null ? amount.toString() : undefined;

  static minuteToStr = (minute?: number): string | undefined => {
    if (minute == null) {
      return undefined;
    }

    return minute.toFixed(2);
  };

  static toWIKI = (tag: TTag | string): string => {
    if (_.isString(tag)) {
      return tag;
    } else if (TagUtil.isTextTag(tag)) {
      if (tag.size != null) {
        return `&size(${tag.size}){${tag.content}};`;
      } else {
        return tag.content;
      }
    } else if (TagUtil.isImageTag(tag)) {
      const { size = 20 } = tag;
      return `&ref(Ref_img/${tag.refer},nolink,${size}x${size});`;
    } else if (TagUtil.isLinkTag(tag)) {
      const { labelTags } = tag;
      const labels = labelTags.map((x) => this.toWIKI(x));
      return `[[${labels.join("")}>${tag.link}]]`;
    }
    return "";
  };
}

export type TTableColumn = {
  tags: (TTag | string)[];
  type?: string;
  attr?: CSSProperties;
};

export type TTableRow = {
  columns: TTableColumn[];
  type: string;
};

export type TTableData = {
  rows: TTableRow[];
  wikiPreLines?: string[];
  wikiPostLines?: string[];
};

export class TableUtil {
  static ROW_FORMATTING = "c";
  static ROW_HEADER = "h";
  static ROW_RECORDS = "";
  static ROW_FOOTER = "f";

  static COLUMN_MERGE_RIGHT = ">";
  static COLUMN_MERGE_UP = "~";

  static isColumn = (column: unknown): column is TTableColumn =>
    (column as TTableColumn)?.tags != null;

  static newColumn = (
    tag: (TTag | string) | (TTag | string)[] | TTableColumn,
    { type, attr }: { type?: string; attr?: CSSProperties } = {}
  ): TTableColumn => {
    return this.isColumn(tag)
      ? tag
      : _.isArray(tag)
      ? { tags: tag, type, attr }
      : {
          tags: [tag],
          type:
            type ??
            (tag === this.COLUMN_MERGE_RIGHT || tag === this.COLUMN_MERGE_UP)
              ? (tag as string)
              : undefined,
          attr,
        };
  };

  static newRow = (
    columns: (TTag | string)[] | (TTag | string)[][] | TTableColumn[],
    type?: string
  ): TTableRow => {
    return {
      columns: columns.map((column) => this.newColumn(column)),
      type: type ?? this.ROW_RECORDS,
    };
  };

  static attrToWIKI = (attr?: CSSProperties): string => {
    if (attr == null) {
      return "";
    }
    return [
      attr.background ? `BGCOLOR(${attr.background}):` : null,
      attr.textAlign ? `${attr.textAlign.toUpperCase()}:` : null,
      attr.width ? attr.width : null,
    ]
      .filter((x) => x != null)
      .join("");
  };

  static columnToWIKI = (column: TTableColumn): string => {
    const tags = column.tags.map((tag) => TagUtil.toWIKI(tag));
    const attrWIKI = this.attrToWIKI(column.attr);
    const tagsWIKI = tags.join("");
    const sep = attrWIKI.length > 0 && tagsWIKI.length > 0 ? ":" : "";
    return `${attrWIKI}${sep}${tagsWIKI}`;
  };

  static rowToWIKI = (row: TTableRow): string => {
    const columns = row.columns.map((column) => this.columnToWIKI(column));
    return `|${columns.join("|")}|${row.type}`;
  };

  static dataToWIKI = (data?: TTableData): string => {
    if (data == null) {
      return "";
    }

    const rows = data.rows.map((row) => this.rowToWIKI(row));
    const pre = data.wikiPreLines?.join("\n") ?? "";
    const post = data.wikiPostLines?.join("\n") ?? "";
    const preNL = pre.length > 0 ? "\n" : "";
    const postNL = post.length > 0 ? "\n" : "";
    return `${pre}${preNL}${rows.join("\n")}${postNL}${post}`;
  };
}
