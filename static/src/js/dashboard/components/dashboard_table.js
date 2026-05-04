/** @odoo-module **/
import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class DashboardTable extends Component {
  static template = "shell_dashboard.Table";

  setup() {
    super.setup();
    this.action = useService("action");
    this.dialog = useService("dialog");
    this.notification = useService("notification");
    this.orm = useService("orm");

    // State lokal untuk pagination
    this.state = useState({
      currentPage: 1,
      rows: [], // data baris untuk halaman aktif
      total: 0,
      loading: false,
      paginationEnabled: this.props.block.config.pagination || false,
      pageSize: this.props.block.config.limit || 10,
    });

    this.goToPage = this.goToPage.bind(this);
    this.loadTableData = this.loadTableData.bind(this);
    this.configureBlock = this.configureBlock.bind(this);
    this.openRecord = this.openRecord.bind(this);

    onWillStart(async () => {
      await this.loadTableData();
    });
  }

  async loadTableData() {
    if (!this.props.block.id) return;
    this.state.loading = true;
    try {
      const offset = (this.state.currentPage - 1) * this.state.pageSize;
      const result = await this.orm.call(
        "dashboard.block",
        "get_table_data_paginated",
        [this.props.block.id, offset, this.state.pageSize],
      );
      if (result.error) {
        this.notification.add(result.error, { type: "danger" });
        this.state.rows = [];
        this.state.total = 0;
      } else {
        this.state.rows = result.rows;
        this.state.total = result.total;
        // Update pageSize jika server mengembalikan limit berbeda
        this.state.pageSize = result.limit;
      }
    } catch (error) {
      console.error("Error loading table data:", error);
      this.notification.add("Failed to load table data", { type: "danger" });
    } finally {
      this.state.loading = false;
    }
  }

  // Panggil saat pindah halaman
  async goToPage(page) {
    if (page < 1 || page > this.totalPages) return;
    this.state.currentPage = page;
    await this.loadTableData();
  }

  // Computed property untuk total halaman
  get totalPages() {
    return Math.ceil(this.state.total / this.state.pageSize);
  }

  // Range halaman yang ditampilkan (misal: 1 2 3 ... 10)
  get visiblePages() {
    const current = this.state.currentPage;
    const total = this.totalPages;
    const delta = 2;
    let start = Math.max(1, current - delta);
    let end = Math.min(total, current + delta);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
      end = Math.min(total, start + 4);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  async configureBlock() {
    try {
      await this.action.doAction({
        type: "ir.actions.act_window",
        res_model: "dashboard.block",
        res_id: this.props.block.id,
        view_mode: "form",
        views: [[false, "form"]],
        target: "new",
      });
    } catch (error) {
      console.error("Error configuring block:", error);
      this.notification.add("Failed to configure block", { type: "danger" });
    }
  }

  openRecord = async (row) => {
    if (!this.props.block.model_name || !row.id) return;

    try {
      await this.action.doAction({
        type: "ir.actions.act_window",
        res_model: this.props.block.model_name,
        res_id: row.id,
        view_mode: "form",
        views: [[false, "form"]],
        target: "current",
      });
    } catch (error) {
      console.error("Error opening record:", error);
    }
  };

  formatCellValue(row, colName) {
    const value = row[colName];

    // Jika value undefined/null
    if (value === undefined || value === null) {
      return "";
    }

    // Jika value adalah Many2one (array [id, name])
    if (Array.isArray(value) && value.length === 2) {
      return value[1]; // kembalikan display name
    }

    // Jika value adalah object (misal Many2one dengan struktur berbeda atau relasi lain)
    if (typeof value === "object" && value !== null) {
      // Coba cari property 'name' atau 'display_name'
      if (value.name) return value.name;
      if (value.display_name) return value.display_name;
      // Fallback ke JSON string (tapi hati2 kepanjangan)
      return JSON.stringify(value);
    }

    // Boolean: tampilkan Yes/No atau true/false
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    // Date/Datetime: jika format ISO, bisa diformat
    if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      // optional: format tanggal lokal
      return value;
    }

    // Default: toString
    return String(value);
  }
}
