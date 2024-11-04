import React from "react";
import DOMPurify from "dompurify";
import _ from "lodash";
import {
  TTag,
  TagUtil,
  TTableColumn,
  TTableRow,
  TTableData,
  TableUtil,
} from "../table";

export const Content: React.FC<{
  content: string;
  attr?: React.CSSProperties;
}> = ({ content, attr }) => {
  const convertToHTML = (input: string): string => {
    input = input.replace(/''(.*?)''/g, "<strong>$1</strong>");
    input = input.replace(/&br;/g, '<br class="spacer" />');
    return input;
  };

  const html = convertToHTML(content ?? "");
  const sanitizedHTML = DOMPurify.sanitize(html);
  return (
    <span dangerouslySetInnerHTML={{ __html: sanitizedHTML }} style={attr} />
  );
};

export const Tag: React.FC<{ tag: TTag | string }> = ({ tag }) => {
  if (_.isString(tag)) {
    return <Content content={tag} />;
  } else if (TagUtil.isTextTag(tag)) {
    return <Content {...tag} />;
  } else if (TagUtil.isImageTag(tag)) {
    const { refer, size = 20 } = tag;
    return (
      <img
        src={`https://cdn.wikiwiki.jp/to/w/sf-jp/Ref_img/::ref/${refer}`}
        className="inline-block"
        alt={refer}
        title={refer}
        width={size}
        height={size}
        loading="lazy"
      />
    );
  } else if (TagUtil.isLinkTag(tag)) {
    const { refer, labelTags } = tag;
    const labels = labelTags.map((x, index) => <Tag key={index} tag={x}></Tag>);
    return <a href={`https://wikiwiki.jp/sf-jp/${refer}`}>{labels}</a>;
  }
  return null;
};

export const TableColumn: React.FC<{
  column: TTableColumn;
  colSpan: number;
  rowSpan: number;
  baseAttr?: React.CSSProperties;
}> = ({ column: { tags, attr }, colSpan, rowSpan, baseAttr }) => {
  return (
    <td
      colSpan={colSpan > 1 ? colSpan : undefined}
      rowSpan={rowSpan > 1 ? rowSpan : undefined}
      style={{ ...(baseAttr ?? {}), ...(attr ?? {}) }}
    >
      {tags.map((tag, index) => (
        <Tag key={index} tag={tag} />
      ))}
    </td>
  );
};

export const TableRow: React.FC<{
  row: TTableRow;
  data: TTableData;
  formatter?: TTableRow;
}> = ({ row, data, formatter }) => {
  const getBaseAttr = (index: number): React.CSSProperties | undefined => {
    const { columns } = formatter ?? {};
    if (columns == null) {
      return undefined;
    }

    for (let i = index; i < columns.length; ++i) {
      if (columns[i].type == null) {
        return columns[i].attr;
      }
    }

    return undefined;
  };

  const getRowSpan = (
    row: TTableRow,
    data: TTableData,
    colIndex: number
  ): number => {
    const rowIndex = data.rows.indexOf(row);
    if (rowIndex < 0) {
      throw Error("invalid TableData row");
    }

    let rowSpan = 1;
    for (let r = rowIndex + 1; r < data.rows.length; ++r) {
      if (data.rows[r].columns[colIndex].type !== TableUtil.COLUMN_MERGE_UP) {
        break;
      }
      rowSpan += 1;
    }

    return rowSpan;
  };

  const htmlRows: React.ReactNode[] = [];
  const { columns } = row;
  let colSpan = 1;

  for (const [i, column] of columns.entries()) {
    switch (column.type) {
      case TableUtil.COLUMN_MERGE_RIGHT:
        colSpan += 1;
        break;
      case TableUtil.COLUMN_MERGE_UP:
        break;
      default:
        htmlRows.push(
          <TableColumn
            key={i}
            column={column}
            colSpan={colSpan}
            rowSpan={getRowSpan(row, data, i)}
            baseAttr={getBaseAttr(i)}
          />
        );
        colSpan = 1;
        break;
    }
  }

  return <tr>{htmlRows}</tr>;
};

export const TableData: React.FC<{ data: TTableData }> = ({ data }) => {
  const htmlHeaders: React.ReactNode[] = [];
  const htmlRows: React.ReactNode[] = [];
  const htmlFooters: React.ReactNode[] = [];
  const { rows } = data;
  let formatter: TTableRow | undefined = undefined;

  for (const [i, row] of rows.entries()) {
    const args = { row, data, formatter };
    switch (row.type) {
      case TableUtil.ROW_FORMATTING:
        formatter = row;
        break;
      case TableUtil.ROW_HEADER:
        htmlHeaders.push(<TableRow key={i} {...args} />);
        break;
      case TableUtil.ROW_RECORDS:
        htmlRows.push(<TableRow key={i} {...args} />);
        break;
      case TableUtil.ROW_FOOTER:
        htmlFooters.push(<TableRow key={i} {...args} />);
        break;
    }
  }

  return (
    <table>
      {htmlHeaders.length > 0 ? <thead>{htmlHeaders}</thead> : null}
      {htmlRows.length > 0 ? <tbody>{htmlRows}</tbody> : null}
      {htmlFooters.length > 0 ? <tfoot>{htmlFooters}</tfoot> : null}
    </table>
  );
};
