/** @odoo-module **/
import { Component, useState } from "@odoo/owl";

export class DateFilter extends Component {
    static template = "shell_dashboard.DateFilter";
    static props = {
        dateRangeText: { type: String, optional: true },
        onToggle: Function,
        onApply: Function,
        onReset: Function,
        showPicker: { type: Boolean, optional: true },
        startDate: { type: Object, optional: true },   // bisa Date atau null
        endDate: { type: Object, optional: true },
    };
    static defaultProps = {
        dateRangeText: "Select Date Range",
        showPicker: false,
    };

    setup() {
        // State lokal untuk two-way binding (opsional,
        // bisa juga langsung pakai props jika parent yang mengelola)
        this.localState = useState({
            startDate: this.props.startDate,
            endDate: this.props.endDate,
        });
    }

    onStartDateChange(event) {
        this.localState.startDate = event.target.value;
        // Jika ingin langsung mengirim ke parent, panggil callback
        // this.props.updateStartDate(event.target.value);
    }

    onEndDateChange(event) {
        this.localState.endDate = event.target.value;
    }

    apply() {
        // Kirim nilai lokal ke parent
        this.props.onApply(this.localState.startDate, this.localState.endDate);
    }

    reset() {
        this.localState.startDate = null;
        this.localState.endDate = null;
        this.props.onReset();
    }
}