# -*- coding: utf-8 -*-
from odoo import models, fields, api

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    # ==== DASHBOARD SETTINGS ====

    # ----- Layout Rules -----
    auto_layout = fields.Boolean(
        string="Auto Layout",
        default=True,
        help="Automatically choose the best dashboard layout based on the number of KPI tiles, charts, and tables."
    )
    manual_layout = fields.Selection(
        string="Manual Layout",
        selection=[
            ("classic", "Classic (KPI on top, charts/tables below)"),
            ("grid", "Grid (all widgets equal size)"),
            ("zonal", "Zonal (filter sidebar + content)"),
            ("drill_down", "Drill-Down (hero + hidden details)"),
        ],
        default="classic",
        help="Manually override the layout when Auto Layout is disabled."
    )

    # ----- Thresholds for Auto Layout -----
    kpi_min_classic = fields.Integer(
        string="Min KPI for Classic",
        default=2,
        help="Minimum number of KPI tiles to use Classic layout. (Ideal: 2-5)"
    )
    kpi_max_classic = fields.Integer(
        string="Max KPI for Classic",
        default=5,
        help="Maximum number of KPI tiles before Classic layout is no longer recommended. (>5 triggers Grid or Zonal)"
    )
    total_widgets_min_grid = fields.Integer(
        string="Min Widgets for Grid",
        default=4,
        help="Minimum total widgets (KPI+charts+tables) to use Grid layout. (Ideal: 4-9)"
    )
    total_widgets_max_grid = fields.Integer(
        string="Max Widgets for Grid",
        default=9,
        help="Maximum total widgets for Grid layout. Beyond this, Zonal layout is recommended."
    )
    filter_min_zonal = fields.Integer(
        string="Min Filters for Zonal",
        default=2,
        help="Minimum number of active filters to trigger Zonal layout. (Ideal: 2-5 filters)"
    )
    hero_only_drill_down = fields.Boolean(
        string="Drill-Down for Single KPI",
        default=True,
        help="If only 1 KPI and no charts/tables, use Drill-Down layout (hero + click for details)."
    )

    # ----- KPI & Tile Appearance -----
    view_icon = fields.Boolean(string="View Icon", default=True)
    icon_position = fields.Selection(
        string="Icon Position",
        selection=[("left", "Left"), ("right", "Right")],
        default="right",
        help="Position of the icon relative to the KPI text."
    )

    # ----- Mobile Layout Rules -----
    mobile_layout_kpi_tile = fields.Selection(
        string="Mobile KPI Tile Layout",
        selection=[
            ("grid", "Grid Layout (even columns) – use when KPI count is 2-4"),
            ("scroll_horizontal", "Horizontal Scroll – use when KPI count >4"),
            ("max_items", "Max Items (limited) – use when you only need top K"),
        ],
        default="max_items",
        help="""Mobile layout rules:
- Grid: best for 2-4 KPI tiles.
- Horizontal Scroll: recommended when KPI >4 to avoid clutter.
- Max Items: shows only the most important KPI (set limit below)."""
    )
    mobile_max_items = fields.Integer(
        string="Max Items on Mobile",
        default=4,
        help="Maximum number of KPI tiles shown when 'Max Items' layout is selected. Follows '7±2' rule – keep ≤5."
    )
    mobile_block_type_grouping = fields.Boolean(
        string="Block Type Grouping",
        default=True,
        help="Group KPI tiles by category (e.g., revenue, orders) on mobile. Improves scanability when >3 tiles."
    )

    # ----- Table Settings (renamed to avoid 'default_' prefix) -----
    table_default_rows = fields.Integer(
        string="Default Table Rows",
        default=10,
        help="Number of rows shown in dashboard tables. Follow the 'above the fold' rule: max 10-15 rows without scrolling."
    )
    table_pagination = fields.Selection(
        string="Table Pagination",
        selection=[
            ("basic", "Basic (Prev/Next)"),
            ("page_numbers", "Page Numbers"),
            ("infinite", "Infinite Scroll"),
        ],
        default="basic",
        help="Pagination style for tables. Use 'page_numbers' when table has >50 rows, 'infinite' for mobile."
    )
    table_auto_height = fields.Boolean(
        string="Auto Table Height",
        default=True,
        help="Automatically adjust table height based on number of rows (max 15 rows). Prevents excessive scrolling."
    )

    @api.model
    def get_values(self):
        res = super(ResConfigSettings, self).get_values()
        params = self.env['ir.config_parameter'].sudo()

        # List of all keys to fetch
        keys = [
            'dashboard.auto_layout', 'dashboard.manual_layout',
            'dashboard.kpi_min_classic', 'dashboard.kpi_max_classic',
            'dashboard.total_widgets_min_grid', 'dashboard.total_widgets_max_grid',
            'dashboard.filter_min_zonal', 'dashboard.hero_only_drill_down',
            'dashboard.view_icon', 'dashboard.icon_position',
            'dashboard.mobile_layout_kpi_tile', 'dashboard.mobile_max_items',
            'dashboard.mobile_block_type_grouping',
            'dashboard.table_default_rows', 'dashboard.table_pagination', 'dashboard.table_auto_height',
        ]
        for key in keys:
            field_name = key.replace('dashboard.', '')
            res[field_name] = params.get_param(key, default=self._default_value(key))

        return res

    def _default_value(self, key):
        """Return default value for a given parameter key."""
        defaults = {
            'dashboard.auto_layout': True,
            'dashboard.manual_layout': 'classic',
            'dashboard.kpi_min_classic': 2,
            'dashboard.kpi_max_classic': 5,
            'dashboard.total_widgets_min_grid': 4,
            'dashboard.total_widgets_max_grid': 9,
            'dashboard.filter_min_zonal': 2,
            'dashboard.hero_only_drill_down': True,
            'dashboard.view_icon': True,
            'dashboard.icon_position': 'right',
            'dashboard.mobile_layout_kpi_tile': 'max_items',
            'dashboard.mobile_max_items': 4,
            'dashboard.mobile_block_type_grouping': True,
            'dashboard.table_default_rows': 10,
            'dashboard.table_pagination': 'basic',
            'dashboard.table_auto_height': True,
        }
        return defaults.get(key, None)

    def set_values(self):
        super(ResConfigSettings, self).set_values()
        params = self.env['ir.config_parameter'].sudo()

        params.set_param('dashboard.auto_layout', str(self.auto_layout))
        params.set_param('dashboard.manual_layout', self.manual_layout)
        params.set_param('dashboard.kpi_min_classic', str(self.kpi_min_classic))
        params.set_param('dashboard.kpi_max_classic', str(self.kpi_max_classic))
        params.set_param('dashboard.total_widgets_min_grid', str(self.total_widgets_min_grid))
        params.set_param('dashboard.total_widgets_max_grid', str(self.total_widgets_max_grid))
        params.set_param('dashboard.filter_min_zonal', str(self.filter_min_zonal))
        params.set_param('dashboard.hero_only_drill_down', str(self.hero_only_drill_down))
        params.set_param('dashboard.view_icon', str(self.view_icon))
        params.set_param('dashboard.icon_position', self.icon_position)
        params.set_param('dashboard.mobile_layout_kpi_tile', self.mobile_layout_kpi_tile)
        params.set_param('dashboard.mobile_max_items', str(self.mobile_max_items))
        params.set_param('dashboard.mobile_block_type_grouping', str(self.mobile_block_type_grouping))
        params.set_param('dashboard.table_default_rows', str(self.table_default_rows))
        params.set_param('dashboard.table_pagination', self.table_pagination)
        params.set_param('dashboard.table_auto_height', str(self.table_auto_height))