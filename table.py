#!/usr/bin/python
import re
from dataclasses import dataclass, field

TABLE_FORMATTING = 'c'
TABLE_HEADER = 'h'
TABLE_RECORDS = ''
TABLE_FOOTER = 'f'


def label_to_html(label: str, remove_meta = True) -> str:
    label = label.replace('&br;', '<br class="spacer" />')
    label = re.sub(r"''([^']*)''", r'<strong>\1</strong>', label)

    if remove_meta:
        index = label.rfind(':')
        if index >= 0:
            label = label[index+1:]

    return label


@dataclass
class ImageTag:
    ref: str
    size: int = 20

    def to_jpwiki(self) -> str:
        return f'&ref(Ref_img/{self.ref},nolink,{self.size}x{self.size})'
    
    def to_html(self) -> str:
        attrib = {
            'src': f'https://cdn.wikiwiki.jp/to/w/sf-jp/Ref_img/::ref/{self.ref}',
            'class': 'inline-block',
            'alt': self.ref,
            'title': self.ref,
            'width': self.size,
            'height': self.size,
            'loading': 'lazy',
        }
        attrib_html = ' '.join(f'{k}="{v}"' for k,v in attrib.items())
        return f'<img {attrib_html} />'


@dataclass
class LinkTag:
    label: str
    ref: str
    imagetag: ImageTag = None
    pre: str = ''
    post: str = ''

    def to_jpwiki(self) -> str:
        image = f'{self.imagetag.to_jpwiki()}; ' if self.imagetag else ''
        return f'{self.pre}[[{image}{self.label}>{self.ref}]]{self.post}'

    def to_html(self) -> str:
        attrib = {
            'href': f'https://wikiwiki.jp/sf-jp/{self.ref}',
        }
        attrib_html = ' '.join(f'{k}="{v}"' for k,v in attrib.items())
        image_tag = self.imagetag.to_html() if self.imagetag else ''
        content = f'{image_tag}{label_to_html(self.label, False)}'
        return f'{self.pre}<a {attrib_html}>{content}</a>{self.post}'


@dataclass
class TableColumn:
    items: list[any]

    def to_jpwiki(self) -> str:
        tags = (item.to_jpwiki() if hasattr(item, 'to_jpwiki') else str(item)
                for item in self.items)
        return ''.join(tags)

    def to_html(self) -> str:
        tags = (item.to_html() if hasattr(item, 'to_html') else label_to_html(item)
                for item in self.items)
        return ''.join(tags)


@dataclass
class TableRow:
    columns: list[TableColumn]
    row_type: str = TABLE_RECORDS
    bg_color: str = None

    def __post_init__(self) -> None:
        def convert(column: any) -> TableColumn:
            if type(column) != TableColumn:
                return TableColumn([column])
            else:
                return column

        self.columns = [convert(column) for column in self.columns]

    def tag(self, open: bool) -> str:
        attrs_html = f'style="background:{self.bg_color}"' if self.bg_color else ''
        pad = '' if open else '/'

        match self.row_type:
            case t if t == TABLE_HEADER:
                return f'<{pad}thead {attrs_html}>'
            case t if t == TABLE_RECORDS:
                return f'<{pad}tbody {attrs_html}>'
            case t if t == TABLE_RECORDS:
                return f'<{pad}tfoot {attrs_html}>'
            case _:
                return ''

    def to_jpwiki(self) -> str:
        column_strs = (column.to_jpwiki() for column in self.columns)
        return f'|{"|".join(column_strs)}|{self.row_type}'
    
    def row_span(self, data: 'TableData', col_index: int) -> int:
        row_index = data.rows.index(self)
        if row_index < 0:
            raise Exception('invalid TableData row')

        row_span = 1
        for r in range(row_index+1, len(data.rows)):
            if data.rows[r].columns[col_index].to_html() != '~':
                break
            row_span += 1

        return row_span

    def to_html(self, data: 'TableData') -> str:
        col_span = 1
        tags = []

        for i, column in enumerate(self.columns):
            label = column.to_html()
            if label == '>':
                col_span += 1
            elif label != '~':
                row_span = self.row_span(data, i)
                tags.append(f'<td colspan="{col_span}" rowspan="{row_span}">{label}</td>')
                col_span = 1

        return ''.join(tags)


@dataclass
class TableData:
    rows: list[TableRow]
    jpwiki_pre_lines: list[str] = field(default_factory=list)
    jpwiki_post_lines: list[str] = field(default_factory=list)

    def with_nl(self, text: str, is_pre: bool) -> str:
        if not text:
            return text
        return f'\n{text}' if is_pre else f'{text}\n'

    def to_jpwiki(self) -> str:
        pre = '\n'.join(self.jpwiki_pre_lines)
        post = '\n'.join(self.jpwiki_post_lines)
        table = '\n'.join(row.to_jpwiki() for row in self.rows)
        return f'{self.with_nl(pre, False)}{table}{self.with_nl(post, True)}'

    def to_html(self) -> str:
        old_row = None
        html = []

        for row in self.rows:
            if row.row_type == TABLE_FORMATTING:
                continue

            if old_row is None or row.row_type != old_row.row_type:
                if old_row:
                    html.append(old_row.tag(False))

                old_row = row
                html.append(row.tag(True))

            html.append(f'<tr>{row.to_html(self)}</tr>')

        if old_row:
            html.append(old_row.tag(False))
        return ''.join(html)
