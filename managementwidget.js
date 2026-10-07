/*
(function () {
  class ProjectEntryWidget extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });

      this._activeTab = "create";

      this._rows = [];
      this._manageRows = [];

      this._validationErrors = [];
      this._validationResult = "true";
      this._lastEvent = "";
      this._savePayload = [];
      this._widgetStatus = "READY";
      this._rowSequence = 1;

      this._glAccountOptions = [];
      this._costCenterOptions = [];
      this._profitCenterOptions = [];
      this._segmentOptions = [];
      this._hierarchyOptions = [];
      this._managementMappingOptions = [];
      this._managementSubMappingOptions = [];

      this._rowOptions = {};
      this._manageRowOptions = {};

      this._manageGlAccountFilter = [];
      this._manageCostCenterFilter = [];
      this._manageProfitCenterFilter = [];
      this._manageSegmentFilter = [];

      this._manageIdSearch = "";
      this._filteredManageIndexes = [];
      this._managePageSize = 100;
      this._manageCurrentPage = 1;

      this._dropdownPanel = null;
      this._dropdownSearch = null;
      this._dropdownList = null;
      this._dropdownOpen = false;
      this._activeDropdownTrigger = null;
      this._activeDropdownTab = "create";
      this._activeDropdownRow = -1;
      this._activeDropdownField = "";
      this._activeDropdownOptions = [];
      this._activeDropdownSelectedKey = "";

      this._filteredDropdownOptions = [];
      this._dropdownBatchSize = 100;
      this._dropdownRenderedCount = 0;
      this._dropdownSearchTimer = null;
      this._dropdownListMoreEl = null;

      this._createColumns = [
        { key: "selected", label: "Sel", type: "checkbox", width: "70px" },
        { key: "GLACCOUNT", label: "GLACCOUNT", type: "select", width: "180px" },
        { key: "COSTCENTER", label: "COSTCENTER", type: "select", width: "180px" },
        { key: "PROFITCENTER", label: "PROFITCENTER", type: "select", width: "180px" },
        { key: "SEGMENT", label: "SEGMENT", type: "select", width: "140px" },
        { key: "ID", label: "ID", type: "readonly", width: "210px" },
        { key: "MANAGEMENT_SUB_MAPPING", label: "MANAGEMENT SUB-MAPPING", type: "select", width: "250px" },
        { key: "MANAGEMENT_MAPPING", label: "MANAGEMENT MAPPING", type: "select", width: "230px" },
        { key: "Hierarchy", label: "Hierarchy", type: "select", width: "180px" }
      ];

      this._manageColumns = [
        { key: "selected", label: "Sel", type: "checkbox", width: "70px" },
        { key: "ID", label: "ID", type: "readonly", width: "210px" },
        { key: "GLACCOUNT", label: "GLACCOUNT", type: "select", width: "180px" },
        { key: "COSTCENTER", label: "COSTCENTER", type: "select", width: "180px" },
        { key: "PROFITCENTER", label: "PROFITCENTER", type: "select", width: "180px" },
        { key: "SEGMENT", label: "SEGMENT", type: "select", width: "140px" },
        { key: "MANAGEMENT_SUB_MAPPING", label: "MANAGEMENT SUB-MAPPING", type: "select", width: "250px" },
        { key: "MANAGEMENT_MAPPING", label: "MANAGEMENT MAPPING", type: "select", width: "230px" },
        { key: "Hierarchy", label: "Hierarchy", type: "select", width: "180px" }
      ];

      this._render();
    }

    connectedCallback() {
      if (!this._rows || this._rows.length === 0) {
        this._rows = [this._createEmptyRow("NEW")];
      }

      this._createDropdownPanel();
      this._normalizeAllRows(this._rows, "NEW");
      this._normalizeAllRows(this._manageRows, "LOADED");
      this._cleanupRowOptions("create");
      this._cleanupRowOptions("manage");
      this._rebuildManageFilteredIndexes();
      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onReady", { status: "ready" });
    }

    disconnectedCallback() {
      this._closeDropdown();

      if (this._dropdownPanel && this._dropdownPanel.parentNode) {
        this._dropdownPanel.parentNode.removeChild(this._dropdownPanel);
      }

      if (this._documentClickHandler) {
        document.removeEventListener("click", this._documentClickHandler);
      }

      this._dropdownPanel = null;
    }

    static get observedAttributes() {
      return [
        "rows",
        "managedata",
        "activetab",
        "lastEvent",
        "validationResult",
        "validationErrors",
        "savePayload",
        "rowCount",
        "selectedRowCount",
        "widgetStatus",
        "glAccountOptions",
        "costCenterOptions",
        "profitCenterOptions",
        "segmentOptions",
        "hierarchyOptions",
        "managementMappingOptions",
        "managementSubMappingOptions",
        "manageGlAccountFilter",
        "manageCostCenterFilter",
        "manageProfitCenterFilter",
        "manageSegmentFilter"
      ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }

      if (name === "rows") {
        this.setRows(newValue || "[]");
        return;
      }

      if (name === "managedata") {
        this.setManageData(newValue || "[]");
        return;
      }

      if (name === "activetab") {
        this.setActiveTab(newValue || "create");
        return;
      }

      if (name === "glAccountOptions") {
        this._glAccountOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "costCenterOptions") {
        this._costCenterOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "profitCenterOptions") {
        this._profitCenterOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "segmentOptions") {
        this._segmentOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "hierarchyOptions") {
        this._hierarchyOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "managementMappingOptions") {
        this._managementMappingOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "managementSubMappingOptions") {
        this._managementSubMappingOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "manageGlAccountFilter") {
        this.setManageGlAccountFilter(newValue || "[]");
        return;
      }

      if (name === "manageCostCenterFilter") {
        this.setManageCostCenterFilter(newValue || "[]");
        return;
      }

      if (name === "manageProfitCenterFilter") {
        this.setManageProfitCenterFilter(newValue || "[]");
        return;
      }

      if (name === "manageSegmentFilter") {
        this.setManageSegmentFilter(newValue || "[]");
        return;
      }
    }

    _createEmptyRow(defaultStatus) {
      return {
        rowId: "ROW_" + String(this._rowSequence++),
        selected: false,
        isModified: false,
        rowStatus: defaultStatus || "NEW",
        GLACCOUNT: "",
        COSTCENTER: "",
        PROFITCENTER: "",
        SEGMENT: "",
        ID: "",
        MANAGEMENT_SUB_MAPPING: "",
        MANAGEMENT_MAPPING: "",
        Hierarchy: ""
      };
    }

    _getRowsByTab(tabName) {
      return tabName === "manage" ? this._manageRows : this._rows;
    }

    _getRowOptionsBucketByTab(tabName) {
      return tabName === "manage" ? this._manageRowOptions : this._rowOptions;
    }

    _setRowOptionsBucketByTab(tabName, value) {
      if (tabName === "manage") {
        this._manageRowOptions = value;
      } else {
        this._rowOptions = value;
      }
    }

    _normalizeRow(row, defaultStatus) {
      if (!row.rowId) {
        row.rowId = "ROW_" + String(this._rowSequence++);
      }

      if (row.selected !== true) {
        row.selected = false;
      }

      if (row.isModified !== true) {
        row.isModified = false;
      }

      if (!row.rowStatus) {
        row.rowStatus = defaultStatus || "LOADED";
      }

      row.GLACCOUNT = this._safeString(row.GLACCOUNT);
      row.COSTCENTER = this._safeString(row.COSTCENTER);
      row.PROFITCENTER = this._safeString(row.PROFITCENTER);
      row.SEGMENT = this._safeString(row.SEGMENT);
      row.ID = this._safeString(row.ID);
      row.MANAGEMENT_SUB_MAPPING = this._safeString(row.MANAGEMENT_SUB_MAPPING);
      row.MANAGEMENT_MAPPING = this._safeString(row.MANAGEMENT_MAPPING);
      row.Hierarchy = this._safeString(row.Hierarchy);

      if (!row.ID || row.ID === "") {
        this._updateRowId(row);
      }
    }

    _normalizeAllRows(rows, defaultStatus) {
      var sourceRows = rows || [];
      for (var i = 0; i < sourceRows.length; i++) {
        this._normalizeRow(sourceRows[i], defaultStatus);
      }
    }

    _safeString(value) {
      if (value === undefined || value === null) {
        return "";
      }
      return String(value).trim();
    }

    _escape(value) {
      if (value === undefined || value === null) {
        return "";
      }
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    _escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    _parseOptions(json) {
      try {
        var arr = JSON.parse(json || "[]");
        if (!Array.isArray(arr)) {
          return [];
        }

        var normalized = [];
        for (var i = 0; i < arr.length; i++) {
          var item = arr[i];

          if (item && typeof item === "object") {
            var key = item.key !== undefined && item.key !== null ? String(item.key) : "";
            var text = item.text !== undefined && item.text !== null ? String(item.text) : key;
            normalized.push({
              key: key,
              text: text,
              searchText: (key + " " + text).toLowerCase()
            });
          } else {
            var val = item !== undefined && item !== null ? String(item) : "";
            normalized.push({
              key: val,
              text: val,
              searchText: val.toLowerCase()
            });
          }
        }

        return normalized;
      } catch (e) {
        return [];
      }
    }

    _cloneOptions(options) {
      var cloned = [];
      if (!options || !options.length) {
        return cloned;
      }

      for (var i = 0; i < options.length; i++) {
        cloned.push({
          key: options[i].key,
          text: options[i].text,
          searchText: options[i].searchText
        });
      }
      return cloned;
    }

    _ensureRowOptionBucket(tabName, rowIndex) {
      var bucket = this._getRowOptionsBucketByTab(tabName);
      if (!bucket[rowIndex]) {
        bucket[rowIndex] = {};
      }
    }

    _getRowOptionsForField(tabName, rowIndex, fieldName) {
      var bucket = this._getRowOptionsBucketByTab(tabName);
      if (
        bucket &&
        bucket[rowIndex] &&
        bucket[rowIndex][fieldName] &&
        Array.isArray(bucket[rowIndex][fieldName])
      ) {
        return bucket[rowIndex][fieldName];
      }
      return null;
    }

    _setRowOptionsForField(tabName, rowIndex, fieldName, options) {
      this._ensureRowOptionBucket(tabName, rowIndex);
      var bucket = this._getRowOptionsBucketByTab(tabName);
      bucket[rowIndex][fieldName] = this._cloneOptions(options || []);
    }

    _rebuildRowOptionsAfterRowChange(tabName, oldRows, newRows) {
      var oldMap = {};
      var newMap = {};
      var rebuilt = {};
      var bucket = this._getRowOptionsBucketByTab(tabName);
      var i = 0;

      for (i = 0; i < oldRows.length; i++) {
        if (oldRows[i] && oldRows[i].rowId) {
          oldMap[oldRows[i].rowId] = i;
        }
      }

      for (i = 0; i < newRows.length; i++) {
        if (newRows[i] && newRows[i].rowId) {
          newMap[newRows[i].rowId] = i;
        }
      }

      for (var rowId in newMap) {
        if (oldMap[rowId] !== undefined && bucket[oldMap[rowId]]) {
          rebuilt[newMap[rowId]] = this._cloneRowFieldOptions(bucket[oldMap[rowId]]);
        }
      }

      this._setRowOptionsBucketByTab(tabName, rebuilt);
    }

    _cloneRowFieldOptions(rowFieldOptions) {
      var result = {};
      if (!rowFieldOptions) {
        return result;
      }

      for (var fieldName in rowFieldOptions) {
        result[fieldName] = this._cloneOptions(rowFieldOptions[fieldName] || []);
      }

      return result;
    }

    _cleanupRowOptions(tabName) {
      var rebuilt = {};
      var rows = this._getRowsByTab(tabName);
      var bucket = this._getRowOptionsBucketByTab(tabName);

      for (var i = 0; i < rows.length; i++) {
        if (bucket[i]) {
          rebuilt[i] = this._cloneRowFieldOptions(bucket[i]);
        }
      }

      this._setRowOptionsBucketByTab(tabName, rebuilt);
    }

    _updateRowId(row) {
      var parts = [];

      if (row.GLACCOUNT) parts.push(row.GLACCOUNT);
      if (row.COSTCENTER) parts.push(row.COSTCENTER);
      if (row.PROFITCENTER) parts.push(row.PROFITCENTER);
      if (row.SEGMENT) parts.push(row.SEGMENT);

      row.ID = parts.join("-");
    }

    _render() {
      this._shadowRoot.innerHTML = `
        <style>
          :host { display:block; font-family:"72", Arial, sans-serif; color:#223548; }
          .wrap { border:1px solid #d9e2ef; border-radius:12px; background:#ffffff; overflow:hidden; }
          .tabbar { display:flex; gap:0; border-bottom:1px solid #dfe8f2; background:#f8fbff; }
          .tabbtn { border:none; background:transparent; padding:14px 18px; cursor:pointer; font-weight:700; font-size:13px; color:#5d7288; border-bottom:3px solid transparent; }
          .tabbtn.active { color:#0a6ed1; border-bottom-color:#0a6ed1; background:#ffffff; }

          .toolbarWrap { display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px; border-bottom:1px solid #e5edf7; background:#f8fbff; flex-wrap:wrap; }
          .toolbarLeft { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
          .toolbarRight { display:flex; justify-content:flex-end; gap:8px; flex-wrap:wrap; margin-left:auto; }

          .searchBox {
            width:260px;
            max-width:100%;
            height:36px;
            border:1px solid #c7d7ea;
            background:#ffffff;
            color:#223548;
            border-radius:8px;
            padding:0 12px;
            font-size:13px;
            outline:none;
          }

          .searchBox:focus {
            border-color:#0a6ed1;
            box-shadow:0 0 0 2px rgba(10,110,209,0.12);
          }

          .btn { border:1px solid #c7d7ea; background:#ffffff; color:#0a6ed1; border-radius:8px; padding:8px 14px; cursor:pointer; font-weight:600; font-size:13px; }
          .btn:hover { background:#f3f8fd; }
          .btn.primary { background:#0a6ed1; color:#ffffff; border-color:#0a6ed1; }
          .btn.danger { color:#bb1e1e; border-color:#efb4b4; background:#fff7f7; }

          .gridWrap { overflow:auto; max-height:520px; background:#ffffff; }
          table { border-collapse:separate; border-spacing:0; width:max-content; min-width:100%; }
          th, td { border-bottom:1px solid #edf2f7; padding:8px; vertical-align:top; white-space:nowrap; box-sizing:border-box; }
          th { position:sticky; top:0; background:#eef4fb; z-index:2; text-align:left; font-size:12px; color:#223548; font-weight:700; }
          tr:hover td { background:#fafcff; }
          tr.errorRow td { background:#fff7f7; }
          tr.modifiedRow td { background:#fffbeb; }

          .readonly-cell {
            width:100%;
            min-height:34px;
            height:34px;
            border:1px solid #d6dee8;
            border-radius:6px;
            padding:6px 10px;
            font-size:13px;
            background:#f6f8fb;
            color:#425466;
            box-sizing:border-box;
            display:flex;
            align-items:center;
          }

          .dropdown-trigger {
            width:100%;
            min-height:34px;
            height:34px;
            border:1px solid #c9d6e5;
            border-radius:6px;
            background:#fff;
            display:flex;
            align-items:center;
            justify-content:space-between;
            box-sizing:border-box;
            padding:0 10px;
            cursor:pointer;
            font-size:13px;
            color:#223548;
            user-select:none;
          }

          .dropdown-trigger .label {
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
            padding-right:8px;
          }

          .dropdown-trigger .arrow {
            color:#6a7f94;
            font-size:11px;
            flex:0 0 auto;
          }

          .dropdown-trigger.error {
            border-color:#e25555;
            background:#fff5f5;
          }

          .rowErr { margin-top:4px; font-size:11px; color:#c53030; white-space:normal; max-width:240px; line-height:1.3; }
          .summary { padding:10px 12px; border-top:1px solid #e5edf7; display:flex; gap:18px; font-size:12px; background:#fafcff; flex-wrap:wrap; }
          .row-checkbox { width:22px; height:22px; cursor:pointer; margin-top:8px; }
          .select-all-wrap { display:flex; align-items:center; gap:6px; }
          .select-all-checkbox { width:16px; height:16px; cursor:pointer; }
          .muted { font-size:12px; color:#6b7c93; }
          .pager { display:flex; justify-content:flex-end; align-items:center; gap:8px; padding:8px 12px; border-bottom:1px solid #e5edf7; background:#ffffff; }
          .empty-msg { padding:40px; text-align:center; color:#8a9bb0; font-size:14px; }
        </style>
        <div class="wrap" id="widgetWrap"></div>
      `;
    }

    _getActiveRows() {
      return this._activeTab === "manage" ? this._manageRows : this._rows;
    }

    _hasSelectedRows(tabName) {
      var rows = this._getRowsByTab(tabName);
      if (tabName !== "manage") {
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].selected === true) { return true; }
        }
        return false;
      }

      var visibleIndexes = this._getManagePagedIndexes();
      for (var j = 0; j < visibleIndexes.length; j++) {
        if (rows[visibleIndexes[j]].selected === true) { return true; }
      }
      return false;
    }

    _areAllRowsSelected(tabName) {
      var rows = this._getRowsByTab(tabName);

      if (!rows || rows.length === 0) {
        return false;
      }

      if (tabName !== "manage") {
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].selected !== true) {
            return false;
          }
        }
        return rows.length > 0;
      }

      var visibleIndexes = this._getManagePagedIndexes();
      if (!visibleIndexes.length) { return false; }

      for (var j = 0; j < visibleIndexes.length; j++) {
        if (rows[visibleIndexes[j]].selected !== true) {
          return false;
        }
      }

      return true;
    }

    _toggleSelectAll(tabName, checked) {
      var rows = this._getRowsByTab(tabName);

      if (tabName !== "manage") {
        for (var i = 0; i < rows.length; i++) {
          rows[i].selected = checked;
        }
      } else {
        var visibleIndexes = this._getManagePagedIndexes();
        for (var j = 0; j < visibleIndexes.length; j++) {
          rows[visibleIndexes[j]].selected = checked;
          rows[visibleIndexes[j]].isModified = true;
          rows[visibleIndexes[j]].rowStatus = "CHANGED";
        }
      }

      this._validationErrors = [];
      this._validationResult = "true";
      this._lastEvent = JSON.stringify({
        type: tabName === "manage" ? "manageSelectAll" : "selectAll",
        selected: checked
      });
      this._widgetStatus = "CHANGED";
      this._syncAll();
      this._refreshToolbarButtons();
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
      this._fireSimpleEvent("onDataChange", {
        activeTab: this._activeTab,
        rows: this._rows,
        manageRows: this._manageRows
      });
    }

    _refreshStatusBarHtml() {
      return `
        <div class="summary" id="summaryBar">
          <div>Active Tab: ${this._activeTab}</div>
          <div>Total Rows: ${this.getVisibleRowCount()}</div>
          <div>Selected Rows: ${this.getSelectedRowCount()}</div>
          <div>Validation: ${this._validationResult}</div>
          <div>Status: ${this._widgetStatus}</div>
        </div>
      `;
    }

    _refreshSummaryOnly() {
      var summaryHost = this._shadowRoot.getElementById("summaryBar");
      if (summaryHost) {
        summaryHost.outerHTML = this._refreshStatusBarHtml();
      }

      var visibleText = this._shadowRoot.getElementById("visibleCountText");
      if (visibleText) {
        visibleText.textContent = "Visible: " + this.getVisibleRowCount();
      }

      var pageInfo = this._shadowRoot.getElementById("pageInfo");
      if (pageInfo) {
        pageInfo.textContent = "Page " + this._getManageCurrentPage() + " of " + this._getManageTotalPages();
      }

      var loadMoreInfo = this._shadowRoot.getElementById("loadMoreInfo");
      if (loadMoreInfo) {
        var total = this.getVisibleRowCount();
        var start = total === 0 ? 0 : ((this._getManageCurrentPage() - 1) * this._managePageSize) + 1;
        var end = Math.min(this._getManageCurrentPage() * this._managePageSize, total);
        loadMoreInfo.textContent = "Showing " + start + " to " + end + " of " + total;
      }
    }

    _isValueInFilter(filterArray, value) {
      if (!filterArray || filterArray.length === 0) {
        return true;
      }

      var cleanValue = this._safeString(value);
      var i = 0;

      for (i = 0; i < filterArray.length; i++) {
        if (this._safeString(filterArray[i]) === cleanValue) {
          return true;
        }
      }

      return false;
    }

    _isManageRowVisible(rowData) {
      if (!rowData) {
        return false;
      }

      if (!this._isValueInFilter(this._manageGlAccountFilter, rowData.GLACCOUNT)) {
        return false;
      }

      if (!this._isValueInFilter(this._manageCostCenterFilter, rowData.COSTCENTER)) {
        return false;
      }

      if (!this._isValueInFilter(this._manageProfitCenterFilter, rowData.PROFITCENTER)) {
        return false;
      }

      if (!this._isValueInFilter(this._manageSegmentFilter, rowData.SEGMENT)) {
        return false;
      }

      if (this._manageIdSearch && this._manageIdSearch !== "") {
        var rowIdText = this._safeString(rowData.ID).toLowerCase();
        var searchText = this._safeString(this._manageIdSearch).toLowerCase();

        if (rowIdText.indexOf(searchText) === -1) {
          return false;
        }
      }

      return true;
    }

    _rebuildManageFilteredIndexes() {
      this._filteredManageIndexes = [];
      for (var i = 0; i < this._manageRows.length; i++) {
        if (this._isManageRowVisible(this._manageRows[i])) {
          this._filteredManageIndexes.push(i);
        }
      }

      var totalPages = this._getManageTotalPages();
      if (this._manageCurrentPage > totalPages) {
        this._manageCurrentPage = totalPages;
      }
      if (this._manageCurrentPage < 1) {
        this._manageCurrentPage = 1;
      }
    }

    _getManageTotalPages() {
      if (this._filteredManageIndexes.length === 0) { return 1; }
      return Math.ceil(this._filteredManageIndexes.length / this._managePageSize);
    }

    _getManagePagedIndexes() {
      var start = (this._manageCurrentPage - 1) * this._managePageSize;
      var end = start + this._managePageSize;
      return this._filteredManageIndexes.slice(start, end);
    }

    _getManageCurrentPage() {
      if (this._activeTab !== "manage") { return 1; }
      return this._manageCurrentPage;
    }

    _goToPreviousPage() {
      if (this._activeTab !== "manage") { return; }
      if (this._manageCurrentPage > 1) {
        this._manageCurrentPage--;
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
      }
    }

    _goToNextPage() {
      if (this._activeTab !== "manage") { return; }
      if (this._manageCurrentPage < this._getManageTotalPages()) {
        this._manageCurrentPage++;
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
      }
    }

    getVisibleRowCount() {
      if (this._activeTab !== "manage") {
        return this._rows.length;
      }
      return this._filteredManageIndexes.length;
    }

    _renderVisibleOnly() {
      var tbody = this._shadowRoot.getElementById("tbodyVirtual");
      if (!tbody) { return; }

      var rowErrorMap = this._getRowErrorMap();
      var html = "";
      var i = 0;
      var j = 0;
      var activeColumns = this._activeTab === "manage" ? this._manageColumns : this._createColumns;
      var visibleIndexes = this._activeTab === "manage"
        ? this._getManagePagedIndexes()
        : (function(length) {
            var arr = [];
            for (var k = 0; k < length; k++) { arr.push(k); }
            return arr;
          }.call(this, this._rows.length));

      if (visibleIndexes.length === 0) {
        var colCount = activeColumns.length;
        html = '<tr><td colspan="' + colCount + '" class="empty-msg">No data to display.</td></tr>';
        tbody.innerHTML = html;
        this._refreshSummaryOnly();
        return;
      }

      for (i = 0; i < visibleIndexes.length; i++) {
        var actualIndex = visibleIndexes[i];
        var sourceRows = this._activeTab === "manage" ? this._manageRows : this._rows;
        var row = sourceRows[actualIndex];
        var rowErrors = rowErrorMap[actualIndex] || [];
        var rowClass = "";

        if (rowErrors.length) {
          rowClass = "errorRow";
        } else if (row.isModified === true) {
          rowClass = "modifiedRow";
        }

        html += '<tr class="' + rowClass + '">';

        for (j = 0; j < activeColumns.length; j++) {
          html += '<td style="width:' + activeColumns[j].width + '">'
            + this._renderCell(this._activeTab, row, actualIndex, activeColumns[j], rowErrors)
            + '</td>';
        }

        html += '</tr>';
      }

      tbody.innerHTML = html;
      this._bindCellEvents();

      var selectAll = this._shadowRoot.getElementById(this._activeTab === "manage" ? "selectAllManage" : "selectAllCreate");
      if (selectAll) { selectAll.checked = this._areAllRowsSelected(this._activeTab); }

      this._refreshSummaryOnly();
    }

    _refreshToolbarButtons() {
      var hasSelection = this._hasSelectedRows(this._activeTab);
      var toolbarRight = this._shadowRoot.getElementById("toolbarRight");
      if (!toolbarRight) { return; }

      if (this._activeTab === "create") {
        var existingDeleteCreate = this._shadowRoot.getElementById("btnDelete");
        if (hasSelection && !existingDeleteCreate) {
          var newDeleteBtnCreate = document.createElement("button");
          newDeleteBtnCreate.className = "btn danger";
          newDeleteBtnCreate.id = "btnDelete";
          newDeleteBtnCreate.textContent = "Delete Selected";
          newDeleteBtnCreate.addEventListener("click", this.deleteSelectedRows.bind(this));
          var btnValidate = this._shadowRoot.getElementById("btnValidate");
          if (btnValidate) {
            toolbarRight.insertBefore(newDeleteBtnCreate, btnValidate);
          } else {
            toolbarRight.appendChild(newDeleteBtnCreate);
          }
        } else if (!hasSelection && existingDeleteCreate) {
          existingDeleteCreate.parentNode.removeChild(existingDeleteCreate);
        }

        var existingCopyCreate = this._shadowRoot.getElementById("btnCopy");
        if (hasSelection && !existingCopyCreate) {
          var newCopyBtnCreate = document.createElement("button");
          newCopyBtnCreate.className = "btn";
          newCopyBtnCreate.id = "btnCopy";
          newCopyBtnCreate.textContent = "Copy";
          newCopyBtnCreate.addEventListener("click", this.copySelectedRows.bind(this));
          var btnDeleteRef = this._shadowRoot.getElementById("btnDelete") || this._shadowRoot.getElementById("btnValidate");
          if (btnDeleteRef) {
            toolbarRight.insertBefore(newCopyBtnCreate, btnDeleteRef);
          } else {
            toolbarRight.appendChild(newCopyBtnCreate);
          }
        } else if (!hasSelection && existingCopyCreate) {
          existingCopyCreate.parentNode.removeChild(existingCopyCreate);
        }
      } else {
        var existingDeleteManage = this._shadowRoot.getElementById("btnDeleteManage");
        if (hasSelection && !existingDeleteManage) {
          var newDeleteBtnManage = document.createElement("button");
          newDeleteBtnManage.className = "btn danger";
          newDeleteBtnManage.id = "btnDeleteManage";
          newDeleteBtnManage.textContent = "Delete Selected";
          newDeleteBtnManage.addEventListener("click", this.deleteManageData.bind(this));
          var btnClearManage = this._shadowRoot.getElementById("btnClearManage");
          if (btnClearManage) {
            toolbarRight.insertBefore(newDeleteBtnManage, btnClearManage);
          } else {
            toolbarRight.appendChild(newDeleteBtnManage);
          }
        } else if (!hasSelection && existingDeleteManage) {
          existingDeleteManage.parentNode.removeChild(existingDeleteManage);
        }
      }
    }

    _refreshTable() {
      var container = this._shadowRoot.getElementById("widgetWrap");
      var hasSelection = this._hasSelectedRows(this._activeTab);
      var allSelected = this._areAllRowsSelected(this._activeTab);
      var selectAllId = this._activeTab === "manage" ? "selectAllManage" : "selectAllCreate";
      var activeColumns = this._activeTab === "manage" ? this._manageColumns : this._createColumns;

      if (this._activeTab === "manage") {
        this._rebuildManageFilteredIndexes();
      }

      var html = '';
      html += '<div class="tabbar">';
      html += '<button class="tabbtn ' + (this._activeTab === 'create' ? 'active' : '') + '" id="tabCreate">Create Mapping</button>';
      html += '<button class="tabbtn ' + (this._activeTab === 'manage' ? 'active' : '') + '" id="tabManage">Manage Mapping</button>';
      html += '</div>';

      html += '<div class="toolbarWrap">';
      if (this._activeTab === "create") {
        html += '<div class="toolbarLeft"></div>';
        html += '<div class="toolbarRight" id="toolbarRight">';
        html += '<button class="btn" id="btnAdd">Add Row</button>';

        if (hasSelection) {
          html += '<button class="btn" id="btnCopy">Copy</button>';
          html += '<button class="btn danger" id="btnDelete">Delete Selected</button>';
        }

        html += '<button class="btn" id="btnValidate">Validate</button>';
        html += '<button class="btn primary" id="btnSave">Save</button>';
        html += '<button class="btn" id="btnClear">Clear</button>';
        html += '</div>';
      } else {
        html += '<div class="toolbarLeft">';
        html += '<input class="searchBox" id="manageIdSearch" type="text" placeholder="Search ID..." value="' + this._escape(this._manageIdSearch || "") + '" />';
        html += '<span class="muted" id="visibleCountText">Visible: ' + this.getVisibleRowCount() + '</span>';
        html += '</div>';

        html += '<div class="toolbarRight" id="toolbarRight">';
        html += '<button class="btn" id="btnLoadManage">Load Data</button>';
        html += '<button class="btn primary" id="btnSaveManage">Save Changes</button>';

        if (hasSelection) {
          html += '<button class="btn danger" id="btnDeleteManage">Delete Selected</button>';
        }

        html += '<button class="btn" id="btnClearManage">Clear</button>';
        html += '</div>';
      }
      html += '</div>';

      if (this._activeTab === "manage") {
        html += '<div class="pager">';
        html += '<span class="muted" id="loadMoreInfo">Showing '
          + (this.getVisibleRowCount() === 0 ? 0 : (((this._manageCurrentPage - 1) * this._managePageSize) + 1))
          + ' to '
          + Math.min(this._manageCurrentPage * this._managePageSize, this.getVisibleRowCount())
          + ' of ' + this.getVisibleRowCount() + '</span>';
        html += '<button class="btn" id="btnPrevPage">Previous</button>';
        html += '<span class="muted" id="pageInfo">Page ' + this._manageCurrentPage + ' of ' + this._getManageTotalPages() + '</span>';
        html += '<button class="btn" id="btnNextPage">Next</button>';
        html += '</div>';
      }

      html += '<div class="gridWrap" id="gridWrap">';
      html += '<table>';
      html += '<thead><tr>';

      for (var h = 0; h < activeColumns.length; h++) {
        var col = activeColumns[h];
        if (col.key === "selected") {
          html += '<th style="width:' + col.width + '"><div class="select-all-wrap"><span>Sel</span><input class="select-all-checkbox" type="checkbox" id="' + selectAllId + '" ' + (allSelected ? 'checked' : '') + ' /></div></th>';
        } else {
          html += '<th style="width:' + col.width + '">' + col.label + '</th>';
        }
      }

      html += '</tr></thead><tbody id="tbodyVirtual"></tbody>';
      html += '</table></div>';
      html += this._refreshStatusBarHtml();

      var oldGrid = this._shadowRoot.getElementById("gridWrap");
      var oldLeft = oldGrid ? oldGrid.scrollLeft : 0;
      var oldTop = oldGrid ? oldGrid.scrollTop : 0;

      container.innerHTML = html;
      this._bindEvents();
      this._renderVisibleOnly();

      var newGrid = this._shadowRoot.getElementById("gridWrap");
      if (newGrid) {
        newGrid.scrollLeft = oldLeft;
        newGrid.scrollTop = oldTop;
      }
    }

    _renderCell(tabName, row, rowIndex, column, rowErrors) {
      var value = row[column.key] !== undefined && row[column.key] !== null ? row[column.key] : "";
      var hasError = this._hasFieldError(column.key, rowErrors);
      var errorCss = hasError ? "error" : "";

      if (column.type === "checkbox") {
        return '<input class="row-checkbox ' + errorCss + '" data-tab="' + tabName + '" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="checkbox" type="checkbox" ' + (value === true ? 'checked' : '') + ' />';
      }

      if (column.type === "readonly") {
        return '<div class="readonly-cell" data-tab="' + tabName + '" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="readonly">' + this._escape(String(value)) + '</div>' + this._renderFieldErrors(column.key, rowErrors);
      }

      if (column.type === "select") {
        var displayText = this._getOptionText(tabName, column.key, value, rowIndex);
        if (!displayText) {
          displayText = "Select";
        }

        return ''
          + '<div class="dropdown-trigger ' + errorCss + '" tabindex="0" data-tab="' + tabName + '" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="select">'
          + '<span class="label">' + this._escape(String(displayText)) + '</span>'
          + '<span class="arrow">▼</span>'
          + '</div>'
          + this._renderFieldErrors(column.key, rowErrors);
      }

      return "";
    }

    _getGlobalOptionsForField(fieldName) {
      if (fieldName === "GLACCOUNT") return this._glAccountOptions || [];
      if (fieldName === "COSTCENTER") return this._costCenterOptions || [];
      if (fieldName === "PROFITCENTER") return this._profitCenterOptions || [];
      if (fieldName === "SEGMENT") return this._segmentOptions || [];
      if (fieldName === "Hierarchy") return this._hierarchyOptions || [];
      if (fieldName === "MANAGEMENT_MAPPING") return this._managementMappingOptions || [];
      if (fieldName === "MANAGEMENT_SUB_MAPPING") return this._managementSubMappingOptions || [];
      return [];
    }

    _getOptionsForField(tabName, fieldName, rowIndex) {
      var rowOptions = this._getRowOptionsForField(tabName, rowIndex, fieldName);
      if (rowOptions !== null) {
        return rowOptions;
      }
      return this._getGlobalOptionsForField(fieldName);
    }

    _getOptionText(tabName, fieldName, value, rowIndex) {
      var options = this._getOptionsForField(tabName, fieldName, rowIndex);
      var valueStr = String(value || "");

      for (var i = 0; i < options.length; i++) {
        if (String(options[i].key) === valueStr) {
          return options[i].text;
        }
      }

      var globalOptions = this._getGlobalOptionsForField(fieldName);
      for (var j = 0; j < globalOptions.length; j++) {
        if (String(globalOptions[j].key) === valueStr) {
          return globalOptions[j].text;
        }
      }

      return "";
    }

    _renderFieldErrors(fieldName, rowErrors) {
      var messages = [];

      for (var i = 0; i < rowErrors.length; i++) {
        var err = rowErrors[i];
        if (err.field === fieldName) {
          messages.push(err.message);
        }
      }

      if (!messages.length) {
        return "";
      }

      return '<div class="rowErr">' + messages.join("<br>") + '</div>';
    }

    _hasFieldError(fieldName, rowErrors) {
      for (var i = 0; i < rowErrors.length; i++) {
        if (rowErrors[i].field === fieldName) {
          return true;
        }
      }
      return false;
    }

    _getRowErrorMap() {
      var map = {};
      for (var i = 0; i < this._validationErrors.length; i++) {
        var err = this._validationErrors[i];
        var rowIndex = Number(err.rowIndex) - 1;
        var errTab = err.tab || "create";

        if (errTab !== this._activeTab) {
          continue;
        }

        if (!map[rowIndex]) {
          map[rowIndex] = [];
        }
        map[rowIndex].push(err);
      }
      return map;
    }

    _createDropdownPanel() {
      if (this._dropdownPanel) {
        return;
      }

      var dropdownPanel = document.createElement("div");
      dropdownPanel.className = "project-widget-dropdown-panel";
      dropdownPanel.style.display = "none";

      dropdownPanel.innerHTML =
        '<div class="dropdown-search-wrap">' +
          '<input type="text" class="dropdown-search-input" placeholder="Search..." />' +
        '</div>' +
        '<div class="dropdown-list"></div>';

      document.body.appendChild(dropdownPanel);

      this._dropdownPanel = dropdownPanel;
      this._dropdownSearch = dropdownPanel.querySelector(".dropdown-search-input");
      this._dropdownList = dropdownPanel.querySelector(".dropdown-list");

      var that = this;

      this._dropdownSearch.addEventListener("input", function () {
        if (that._dropdownSearchTimer) {
          clearTimeout(that._dropdownSearchTimer);
        }

        that._dropdownSearchTimer = setTimeout(function () {
          that._applyDropdownSearch(that._dropdownSearch.value);
        }, 120);
      });

      this._dropdownList.addEventListener("scroll", function () {
        var nearBottom = that._dropdownList.scrollTop + that._dropdownList.clientHeight >= that._dropdownList.scrollHeight - 30;
        if (nearBottom) {
          that._appendNextDropdownBatch();
        }
      });

      this._documentClickHandler = function (e) {
        if (!that._dropdownOpen) {
          return;
        }

        var insidePanel = that._dropdownPanel && that._dropdownPanel.contains(e.target);
        var insideTrigger = that._activeDropdownTrigger && that._activeDropdownTrigger.contains(e.target);

        if (!insidePanel && !insideTrigger) {
          that._closeDropdown();
        }
      };

      document.addEventListener("click", this._documentClickHandler);
    }

    _openDropdown(triggerEl, tabName, rowIndex, fieldName) {
      this._createDropdownPanel();

      this._activeDropdownTrigger = triggerEl;
      this._activeDropdownTab = tabName;
      this._activeDropdownRow = rowIndex;
      this._activeDropdownField = fieldName;
      this._activeDropdownOptions = this._getOptionsForField(tabName, fieldName, rowIndex) || [];

      var rows = this._getRowsByTab(tabName);
      this._activeDropdownSelectedKey = rows[rowIndex] ? rows[rowIndex][fieldName] : "";

      var triggerRect = triggerEl.getBoundingClientRect();
      var dropdownWidth = Math.max(triggerRect.width, 320);
      var dropdownTop = triggerRect.bottom + 4;
      var dropdownLeft = triggerRect.left;

      if (dropdownLeft + dropdownWidth > window.innerWidth - 10) {
        dropdownLeft = window.innerWidth - dropdownWidth - 10;
      }

      if (dropdownLeft < 10) {
        dropdownLeft = 10;
      }

      this._dropdownPanel.style.display = "block";
      this._dropdownPanel.style.position = "fixed";
      this._dropdownPanel.style.left = dropdownLeft + "px";
      this._dropdownPanel.style.top = dropdownTop + "px";
      this._dropdownPanel.style.width = dropdownWidth + "px";
      this._dropdownPanel.style.zIndex = "999999";

      this._dropdownSearch.value = "";
      this._filteredDropdownOptions = this._activeDropdownOptions.slice(0);
      this._dropdownRenderedCount = 0;
      this._dropdownList.innerHTML = "";
      this._appendNextDropdownBatch();
      this._dropdownOpen = true;

      var that = this;
      setTimeout(function () {
        if (that._dropdownSearch) {
          that._dropdownSearch.focus();
        }
      }, 0);
    }

    _closeDropdown() {
      if (this._dropdownPanel) {
        this._dropdownPanel.style.display = "none";
      }

      this._dropdownOpen = false;
      this._activeDropdownTrigger = null;
      this._activeDropdownTab = "create";
      this._activeDropdownRow = -1;
      this._activeDropdownField = "";
      this._activeDropdownOptions = [];
      this._activeDropdownSelectedKey = "";
      this._filteredDropdownOptions = [];
      this._dropdownRenderedCount = 0;
    }

    _applyDropdownSearch(searchText) {
      var source = this._activeDropdownOptions || [];
      var searchValue = String(searchText || "").toLowerCase().trim();
      var filtered = [];
      var i = 0;

      if (searchValue === "") {
        this._filteredDropdownOptions = source.slice(0);
      } else {
        for (i = 0; i < source.length; i++) {
          if (source[i].searchText.indexOf(searchValue) > -1) {
            filtered.push(source[i]);
          }
        }
        this._filteredDropdownOptions = filtered;
      }

      this._dropdownRenderedCount = 0;
      this._dropdownList.innerHTML = "";
      this._appendNextDropdownBatch();
    }

    _appendNextDropdownBatch() {
      if (!this._dropdownList || !this._filteredDropdownOptions) {
        return;
      }

      var start = this._dropdownRenderedCount;
      var end = start + this._dropdownBatchSize;

      if (start >= this._filteredDropdownOptions.length) {
        return;
      }

      var fragment = document.createDocumentFragment();
      var that = this;

      for (var i = start; i < end && i < this._filteredDropdownOptions.length; i++) {
        var opt = this._filteredDropdownOptions[i];
        var item = document.createElement("div");
        item.className = "dropdown-item";

        if (String(opt.key) === String(this._activeDropdownSelectedKey)) {
          item.className += " selected";
        }

        item.textContent = opt.text;
        item.setAttribute("data-key", opt.key);

        item.addEventListener("mousedown", function (e) {
          e.preventDefault();

          var selectedKeyValue = this.getAttribute("data-key");
          var rowIndex = that._activeDropdownRow;
          var fieldName = that._activeDropdownField;
          var tabName = that._activeDropdownTab;
          var rows = that._getRowsByTab(tabName);

          if (!rows[rowIndex]) {
            that._closeDropdown();
            return;
          }

          rows[rowIndex][fieldName] = selectedKeyValue;

          if (tabName !== "manage") {
            that._updateRowId(rows[rowIndex]);
          }

          rows[rowIndex].isModified = true;
          rows[rowIndex].rowStatus = "CHANGED";

          that._validationErrors = [];
          that._validationResult = "true";
          that._widgetStatus = "CHANGED";
          that._lastEvent = JSON.stringify({
            type: tabName === "manage" ? "manageFieldChange" : "fieldChange",
            tab: tabName,
            rowIndex: rowIndex,
            field: fieldName,
            value: selectedKeyValue
          });

          that._syncAll();
          that._renderVisibleOnly();
          that._refreshToolbarButtons();
          that._refreshSummaryOnly();
          that._fireSimpleEvent("onFieldChange", { tab: tabName, rowIndex: rowIndex, field: fieldName, value: selectedKeyValue });
          that._fireSimpleEvent("onDataChange", { activeTab: that._activeTab, rows: that._rows, manageRows: that._manageRows });
          that._closeDropdown();
        });

        fragment.appendChild(item);
      }

      this._dropdownList.appendChild(fragment);
      this._dropdownRenderedCount = Math.min(end, this._filteredDropdownOptions.length);

      if (this._dropdownRenderedCount < this._filteredDropdownOptions.length) {
        if (!this._dropdownListMoreEl) {
          this._dropdownListMoreEl = document.createElement("div");
          this._dropdownListMoreEl.className = "dropdown-more";
        }

        this._dropdownListMoreEl.textContent =
          "Showing " + String(this._dropdownRenderedCount) + " of " + String(this._filteredDropdownOptions.length);

        if (!this._dropdownListMoreEl.parentNode) {
          this._dropdownList.appendChild(this._dropdownListMoreEl);
        } else {
          this._dropdownList.appendChild(this._dropdownListMoreEl);
        }
      } else {
        if (this._dropdownListMoreEl && this._dropdownListMoreEl.parentNode) {
          this._dropdownListMoreEl.parentNode.removeChild(this._dropdownListMoreEl);
        }
      }

      if (this._filteredDropdownOptions.length === 0) {
        this._dropdownList.innerHTML = '<div class="dropdown-empty">No results found</div>';
      }
    }

    _bindEvents() {
      var that = this;

      var tabCreate = this._shadowRoot.getElementById("tabCreate");
      if (tabCreate) {
        tabCreate.addEventListener("click", function () {
          that._changeTabFromUI("create");
        });
      }

      var tabManage = this._shadowRoot.getElementById("tabManage");
      if (tabManage) {
        tabManage.addEventListener("click", function () {
          that._changeTabFromUI("manage");
        });
      }

      if (this._activeTab === "create") {
        var btnAdd = this._shadowRoot.getElementById("btnAdd");
        if (btnAdd) btnAdd.addEventListener("click", function () { that.addRow(); });

        var btnCopy = this._shadowRoot.getElementById("btnCopy");
        if (btnCopy) btnCopy.addEventListener("click", function () { that.copySelectedRows(); });

        var btnDelete = this._shadowRoot.getElementById("btnDelete");
        if (btnDelete) btnDelete.addEventListener("click", function () { that.deleteSelectedRows(); });

        var btnValidate = this._shadowRoot.getElementById("btnValidate");
        if (btnValidate) btnValidate.addEventListener("click", function () { that.validate(); });

        var btnSave = this._shadowRoot.getElementById("btnSave");
        if (btnSave) btnSave.addEventListener("click", function () { that.save(); });

        var btnClear = this._shadowRoot.getElementById("btnClear");
        if (btnClear) btnClear.addEventListener("click", function () { that.clear(); });

        var selectAllCreate = this._shadowRoot.getElementById("selectAllCreate");
        if (selectAllCreate) {
          selectAllCreate.addEventListener("change", function () {
            that._toggleSelectAll("create", selectAllCreate.checked);
          });
        }
      }

      if (this._activeTab === "manage") {
        var manageIdSearch = this._shadowRoot.getElementById("manageIdSearch");
        if (manageIdSearch) {
          manageIdSearch.value = this._manageIdSearch || "";
          manageIdSearch.addEventListener("input", function () {
            that._manageIdSearch = this.value || "";
            that._manageCurrentPage = 1;
            that._rebuildManageFilteredIndexes();
            that._renderVisibleOnly();
          });
        }

        var btnLoadManage = this._shadowRoot.getElementById("btnLoadManage");
        if (btnLoadManage) btnLoadManage.addEventListener("click", function () { that.loadManageData(); });

        var btnSaveManage = this._shadowRoot.getElementById("btnSaveManage");
        if (btnSaveManage) btnSaveManage.addEventListener("click", function () { that.saveManageData(); });

        var btnDeleteManage = this._shadowRoot.getElementById("btnDeleteManage");
        if (btnDeleteManage) btnDeleteManage.addEventListener("click", function () { that.deleteManageData(); });

        var btnClearManage = this._shadowRoot.getElementById("btnClearManage");
        if (btnClearManage) btnClearManage.addEventListener("click", function () { that.clear(); });

        var btnPrevPage = this._shadowRoot.getElementById("btnPrevPage");
        if (btnPrevPage) btnPrevPage.addEventListener("click", function () { that._goToPreviousPage(); });

        var btnNextPage = this._shadowRoot.getElementById("btnNextPage");
        if (btnNextPage) btnNextPage.addEventListener("click", function () { that._goToNextPage(); });

        var selectAllManage = this._shadowRoot.getElementById("selectAllManage");
        if (selectAllManage) {
          selectAllManage.addEventListener("change", function () {
            that._toggleSelectAll("manage", selectAllManage.checked);
          });
        }
      }
    }

    _bindCellEvents() {
      var that = this;
      var allElements = this._shadowRoot.querySelectorAll("[data-row][data-field]");

      Array.prototype.forEach.call(allElements, function (el) {
        var type = el.getAttribute("data-type");
        var tabName = el.getAttribute("data-tab");

        if (type === "checkbox") {
          el.addEventListener("change", function () {
            var rowIndex = parseInt(this.getAttribute("data-row"), 10);
            var fieldName = this.getAttribute("data-field");
            var value = this.checked;
            var rows = that._getRowsByTab(tabName);

            if (!rows[rowIndex]) {
              return;
            }

            rows[rowIndex][fieldName] = value;
            rows[rowIndex].isModified = true;
            rows[rowIndex].rowStatus = "CHANGED";
            that._validationErrors = [];
            that._validationResult = "true";
            that._widgetStatus = "CHANGED";
            that._lastEvent = JSON.stringify({
              type: tabName === "manage" ? "manageFieldChange" : "fieldChange",
              tab: tabName,
              rowIndex: rowIndex,
              field: fieldName,
              value: value
            });

            that._syncAll();
            that._renderVisibleOnly();
            that._refreshToolbarButtons();
            that._refreshSummaryOnly();
            that._fireSimpleEvent("onFieldChange", { tab: tabName, rowIndex: rowIndex, field: fieldName, value: value });
            that._fireSimpleEvent("onDataChange", { activeTab: that._activeTab, rows: that._rows, manageRows: that._manageRows });
          });
          return;
        }

        if (type === "select") {
          el.addEventListener("click", function (e) {
            e.stopPropagation();
            var rowIndex = parseInt(this.getAttribute("data-row"), 10);
            var fieldName = this.getAttribute("data-field");
            that._openDropdown(this, tabName, rowIndex, fieldName);
          });

          el.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              var rowIndex = parseInt(this.getAttribute("data-row"), 10);
              var fieldName = this.getAttribute("data-field");
              that._openDropdown(this, tabName, rowIndex, fieldName);
            }
          });
          return;
        }
      });
    }

    _changeTabFromUI(tabName) {
      if (tabName !== "create" && tabName !== "manage") {
        tabName = "create";
      }

      this._activeTab = tabName;
      this._validationErrors = [];
      this._validationResult = "true";
      this._lastEvent = JSON.stringify({ type: "tabChange", activeTab: tabName });
      this._widgetStatus = "READY";

      if (tabName === "manage") {
        this._rebuildManageFilteredIndexes();
      }

      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, rows: this._rows, manageRows: this._manageRows });
    }

    _fireSimpleEvent(name, detail) {
      this.dispatchEvent(new CustomEvent(name, { detail: detail }));
    }

    _firePropertiesChanged() {
      this.dispatchEvent(new CustomEvent("propertiesChanged", {
        detail: {
          properties: {
            rows: JSON.stringify(this._rows),
            managedata: JSON.stringify(this._manageRows),
            activetab: this._activeTab,
            lastEvent: this._lastEvent,
            validationResult: this._validationResult,
            validationErrors: JSON.stringify(this._validationErrors || []),
            savePayload: JSON.stringify(this._savePayload || []),
            rowCount: this.getRowCount(),
            selectedRowCount: this.getSelectedRowCount(),
            widgetStatus: this._widgetStatus,
            manageGlAccountFilter: JSON.stringify(this._manageGlAccountFilter || []),
            manageCostCenterFilter: JSON.stringify(this._manageCostCenterFilter || []),
            manageProfitCenterFilter: JSON.stringify(this._manageProfitCenterFilter || []),
            manageSegmentFilter: JSON.stringify(this._manageSegmentFilter || [])
          }
        }
      }));
    }

    _syncAll() {
      this._firePropertiesChanged();
    }

    addRow() {
      if (this._activeTab !== "create") {
        return;
      }

      this._rows.push(this._createEmptyRow("NEW"));
      this._widgetStatus = "CHANGED";
      this._lastEvent = JSON.stringify({ type: "addRow", tab: "create" });
      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, rows: this._rows });
    }

    copySelectedRows() {
      if (this._activeTab !== "create") {
        return;
      }

      var copiedRows = [];
      var copiedOptions = [];
      var i = 0;

      for (i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected === true) {
          var newRow = {
            rowId: "ROW_" + String(this._rowSequence++),
            selected: false,
            isModified: true,
            rowStatus: "NEW",
            GLACCOUNT: this._rows[i].GLACCOUNT || "",
            COSTCENTER: this._rows[i].COSTCENTER || "",
            PROFITCENTER: this._rows[i].PROFITCENTER || "",
            SEGMENT: this._rows[i].SEGMENT || "",
            ID: "",
            MANAGEMENT_SUB_MAPPING: this._rows[i].MANAGEMENT_SUB_MAPPING || "",
            MANAGEMENT_MAPPING: this._rows[i].MANAGEMENT_MAPPING || "",
            Hierarchy: this._rows[i].Hierarchy || ""
          };

          copiedRows.push(newRow);

          if (this._rowOptions[i]) {
            copiedOptions.push(this._cloneRowFieldOptions(this._rowOptions[i]));
          } else {
            copiedOptions.push(null);
          }
        }
      }

      if (!copiedRows.length) {
        return;
      }

      for (var j = 0; j < copiedRows.length; j++) {
        this._updateRowId(copiedRows[j]);
        this._rows.push(copiedRows[j]);

        var newIndex = this._rows.length - 1;
        if (copiedOptions[j]) {
          this._rowOptions[newIndex] = copiedOptions[j];
        }
      }

      this._validationErrors = [];
      this._validationResult = "true";
      this._widgetStatus = "CHANGED";
      this._lastEvent = JSON.stringify({ type: "copySelectedRows", tab: "create", copiedCount: copiedRows.length });
      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, rows: this._rows });
    }

    deleteSelectedRows() {
      if (this._activeTab !== "create") {
        return;
      }

      var oldRows = this._rows.slice(0);
      var remainingRows = [];

      for (var i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected !== true) {
          remainingRows.push(this._rows[i]);
        }
      }

      if (!remainingRows.length) {
        remainingRows = [this._createEmptyRow("NEW")];
      }

      this._rows = remainingRows;
      this._normalizeAllRows(this._rows, "NEW");
      this._rebuildRowOptionsAfterRowChange("create", oldRows, this._rows);
      this._validationErrors = [];
      this._validationResult = "true";
      this._widgetStatus = "CHANGED";
      this._lastEvent = JSON.stringify({ type: "deleteSelectedRows", tab: "create" });
      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, rows: this._rows });
    }

    clear() {
      if (this._activeTab === "manage") {
        this._manageRows = [];
        this._manageRowOptions = {};
        this._validationErrors = [];
        this._validationResult = "true";
        this._lastEvent = JSON.stringify({ type: "clearManage", tab: "manage" });
        this._manageIdSearch = "";
        this._filteredManageIndexes = [];
        this._manageCurrentPage = 1;
        this._widgetStatus = "READY";
      } else {
        this._rows = [this._createEmptyRow("NEW")];
        this._rowOptions = {};
        this._validationErrors = [];
        this._validationResult = "true";
        this._savePayload = [];
        this._lastEvent = JSON.stringify({ type: "clear", tab: "create" });
        this._widgetStatus = "READY";
      }

      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, rows: this._rows, manageRows: this._manageRows });
    }

    validate() {
      if (this._activeTab !== "create") {
        return "true";
      }

      var errors = [];
      var idMap = {};

      for (var i = 0; i < this._rows.length; i++) {
        var row = this._rows[i];
        var rowIndex = i + 1;

        if (!row.GLACCOUNT) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "GLACCOUNT", message: "GLACCOUNT is mandatory" });
        }
        if (!row.COSTCENTER) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "COSTCENTER", message: "COSTCENTER is mandatory" });
        }
        if (!row.PROFITCENTER) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "PROFITCENTER", message: "PROFITCENTER is mandatory" });
        }
        if (!row.SEGMENT) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "SEGMENT", message: "SEGMENT is mandatory" });
        }
        if (!row.Hierarchy) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "Hierarchy", message: "Hierarchy is mandatory" });
        }
        if (!row.MANAGEMENT_MAPPING) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "MANAGEMENT_MAPPING", message: "MANAGEMENT MAPPING is mandatory" });
        }
        if (!row.MANAGEMENT_SUB_MAPPING) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "MANAGEMENT_SUB_MAPPING", message: "MANAGEMENT SUB-MAPPING is mandatory" });
        }

        this._updateRowId(row);

        if (!row.ID) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "ID", message: "ID could not be generated" });
        }

        if (row.ID) {
          if (idMap[row.ID]) {
            errors.push({ tab: "create", rowIndex: rowIndex, field: "ID", message: "Duplicate ID found" });
          } else {
            idMap[row.ID] = true;
          }
        }
      }

      this._validationErrors = errors;
      this._validationResult = errors.length === 0 ? "true" : "false";
      this._lastEvent = JSON.stringify({
        type: "validate",
        tab: "create",
        validationResult: this._validationResult,
        errorCount: errors.length
      });
      this._widgetStatus = errors.length === 0 ? "VALID" : "ERROR";

      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onValidate", {
        activeTab: this._activeTab,
        validationResult: this._validationResult,
        validationErrors: errors
      });

      return this._validationResult;
    }

    save() {
      if (this._activeTab !== "create") {
        return;
      }

      var validationResult = this.validate();

      if (validationResult !== "true") {
        this._savePayload = [];
        this._lastEvent = JSON.stringify({
          type: "save",
          tab: "create",
          status: "VALIDATION_FAILED",
          validationResult: this._validationResult,
          errorCount: this._validationErrors.length
        });
        this._widgetStatus = "ERROR";
        this._syncAll();
        this._fireSimpleEvent("onDataChange", {
          activeTab: this._activeTab,
          rows: this._rows,
          savePayload: [],
          validationErrors: this._validationErrors
        });
        return;
      }

      var payload = [];

      for (var i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected === true) {
          payload.push({
            GLACCOUNT: this._rows[i].GLACCOUNT,
            COSTCENTER: this._rows[i].COSTCENTER,
            PROFITCENTER: this._rows[i].PROFITCENTER,
            SEGMENT: this._rows[i].SEGMENT,
            ID: this._rows[i].ID,
            MANAGEMENT_SUB_MAPPING: this._rows[i].MANAGEMENT_SUB_MAPPING,
            MANAGEMENT_MAPPING: this._rows[i].MANAGEMENT_MAPPING,
            Hierarchy: this._rows[i].Hierarchy
          });
        }
      }

      if (payload.length === 0) {
        this._savePayload = [];
        this._validationErrors = [{
          tab: "create",
          rowIndex: 1,
          field: "selected",
          message: "Please select at least one row to save"
        }];
        this._validationResult = "false";
        this._widgetStatus = "ERROR";
        this._lastEvent = JSON.stringify({
          type: "save",
          tab: "create",
          status: "NO_SELECTION",
          payloadCount: 0
        });
        this._syncAll();
        this._refreshTable();
        this._fireSimpleEvent("onDataChange", {
          activeTab: this._activeTab,
          rows: this._rows,
          savePayload: [],
          validationErrors: this._validationErrors
        });
        return;
      }

      this._validationErrors = [];
      this._validationResult = "true";
      this._savePayload = payload;
      this._lastEvent = JSON.stringify({
        type: "save",
        tab: "create",
        status: "READY",
        payloadCount: payload.length
      });
      this._widgetStatus = "SAVE_READY";
      this._syncAll();
      this._fireSimpleEvent("onDataChange", {
        activeTab: this._activeTab,
        rows: this._rows,
        savePayload: payload
      });
    }

    loadManageData() {
      this._lastEvent = JSON.stringify({
        type: "loadManageData",
        tab: "manage"
      });
      this._widgetStatus = "READY";
      this._syncAll();
      this._fireSimpleEvent("onDataChange", {
        activeTab: this._activeTab,
        manageRows: this._manageRows
      });
    }

    saveManageData() {
      if (this._activeTab !== "manage") {
        return;
      }

      var payload = [];
      var visibleIndexes = this._getManagePagedIndexes();

      for (var x = 0; x < visibleIndexes.length; x++) {
        var i = visibleIndexes[x];
        if (this._manageRows[i].selected === true) {
          payload.push({
            GLACCOUNT: this._manageRows[i].GLACCOUNT,
            COSTCENTER: this._manageRows[i].COSTCENTER,
            PROFITCENTER: this._manageRows[i].PROFITCENTER,
            SEGMENT: this._manageRows[i].SEGMENT,
            ID: this._manageRows[i].ID,
            MANAGEMENT_SUB_MAPPING: this._manageRows[i].MANAGEMENT_SUB_MAPPING,
            MANAGEMENT_MAPPING: this._manageRows[i].MANAGEMENT_MAPPING,
            Hierarchy: this._manageRows[i].Hierarchy,
            rowStatus: this._manageRows[i].rowStatus || "CHANGED"
          });
        }
      }

      if (payload.length === 0) {
        this._savePayload = [];
        this._validationErrors = [{
          tab: "manage",
          rowIndex: 1,
          field: "selected",
          message: "Please select at least one row to save"
        }];
        this._validationResult = "false";
        this._widgetStatus = "ERROR";
        this._lastEvent = JSON.stringify({
          type: "saveManageData",
          tab: "manage",
          status: "NO_SELECTION",
          payloadCount: 0
        });
        this._syncAll();
        this._renderVisibleOnly();
        this._fireSimpleEvent("onDataChange", {
          activeTab: this._activeTab,
          manageRows: this._manageRows,
          savePayload: []
        });
        return;
      }

      this._validationErrors = [];
      this._validationResult = "true";
      this._savePayload = payload;
      this._widgetStatus = "SAVE_READY";
      this._lastEvent = JSON.stringify({
        type: "saveManageData",
        tab: "manage",
        status: "READY",
        payloadCount: payload.length
      });
      this._syncAll();
      this._fireSimpleEvent("onDataChange", {
        activeTab: this._activeTab,
        manageRows: this._manageRows,
        savePayload: payload
      });
    }

    deleteManageData() {
      if (this._activeTab !== "manage") {
        return;
      }

      var payload = [];
      var visibleIndexes = this._getManagePagedIndexes();

      for (var x = 0; x < visibleIndexes.length; x++) {
        var i = visibleIndexes[x];
        if (this._manageRows[i].selected === true) {
          payload.push({
            GLACCOUNT: this._manageRows[i].GLACCOUNT,
            COSTCENTER: this._manageRows[i].COSTCENTER,
            PROFITCENTER: this._manageRows[i].PROFITCENTER,
            SEGMENT: this._manageRows[i].SEGMENT,
            ID: this._manageRows[i].ID,
            MANAGEMENT_SUB_MAPPING: this._manageRows[i].MANAGEMENT_SUB_MAPPING,
            MANAGEMENT_MAPPING: this._manageRows[i].MANAGEMENT_MAPPING,
            Hierarchy: this._manageRows[i].Hierarchy,
            rowStatus: "DELETE"
          });
        }
      }

      if (payload.length === 0) {
        this._savePayload = [];
        this._validationErrors = [{
          tab: "manage",
          rowIndex: 1,
          field: "selected",
          message: "Please select at least one row to delete"
        }];
        this._validationResult = "false";
        this._widgetStatus = "ERROR";
        this._lastEvent = JSON.stringify({
          type: "deleteManageData",
          tab: "manage",
          status: "NO_SELECTION",
          payloadCount: 0
        });
        this._syncAll();
        this._renderVisibleOnly();
        this._fireSimpleEvent("onDataChange", {
          activeTab: this._activeTab,
          manageRows: this._manageRows,
          savePayload: []
        });
        return;
      }

      this._validationErrors = [];
      this._validationResult = "true";
      this._savePayload = payload;
      this._widgetStatus = "SAVE_READY";
      this._lastEvent = JSON.stringify({
        type: "deleteManageData",
        tab: "manage",
        status: "READY",
        payloadCount: payload.length
      });
      this._syncAll();
      this._fireSimpleEvent("onDataChange", {
        activeTab: this._activeTab,
        manageRows: this._manageRows,
        savePayload: payload
      });
    }

    getRows() {
      return JSON.stringify(this._rows || []);
    }

    setRows(rowsJson) {
      var oldRows = this._rows.slice(0);

      try {
        this._rows = JSON.parse(rowsJson || "[]");
        if (!Array.isArray(this._rows) || this._rows.length === 0) {
          this._rows = [this._createEmptyRow("NEW")];
        }
      } catch (e) {
        this._rows = [this._createEmptyRow("NEW")];
      }

      this._normalizeAllRows(this._rows, "NEW");
      this._rebuildRowOptionsAfterRowChange("create", oldRows, this._rows);
      this._cleanupRowOptions("create");
      this._widgetStatus = "LOADED";
      this._syncAll();
      this._refreshTable();
    }

    getManageData() {
      return JSON.stringify(this._manageRows || []);
    }

    setManageData(rowsJson) {
      var oldRows = this._manageRows.slice(0);

      try {
        this._manageRows = JSON.parse(rowsJson || "[]");
        if (!Array.isArray(this._manageRows)) {
          this._manageRows = [];
        }
      } catch (e) {
        this._manageRows = [];
      }

      this._normalizeAllRows(this._manageRows, "LOADED");
      this._rebuildRowOptionsAfterRowChange("manage", oldRows, this._manageRows);
      this._cleanupRowOptions("manage");
      this._rebuildManageFilteredIndexes();
      this._widgetStatus = "LOADED";
      this._syncAll();
      this._refreshTable();
    }

    setActiveTab(tabName) {
      var normalizedTab = tabName === "manage" ? "manage" : "create";
      this._activeTab = normalizedTab;
      if (normalizedTab === "manage") {
        this._rebuildManageFilteredIndexes();
      }
      this._syncAll();
      this._refreshTable();
    }

    getRowCount() {
      var rows = this._getActiveRows();
      return rows.length;
    }

    getSelectedRowCount() {
      if (this._activeTab !== "manage") {
        var rows = this._getActiveRows();
        var count = 0;
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].selected === true) { count++; }
        }
        return count;
      }

      var visibleIndexes = this._getManagePagedIndexes();
      var countManage = 0;
      for (var j = 0; j < visibleIndexes.length; j++) {
        if (this._manageRows[visibleIndexes[j]].selected === true) {
          countManage++;
        }
      }
      return countManage;
    }

    getRowValue(rowIndex, fieldName) {
      var rows = this._getActiveRows();
      if (rowIndex < 0 || rowIndex >= rows.length) {
        return "";
      }
      var row = rows[rowIndex];
      if (!row || row[fieldName] === undefined || row[fieldName] === null) {
        return "";
      }
      return String(row[fieldName]);
    }

    getSelectedRowValue(selectedIndex, fieldName) {
      if (this._activeTab !== "manage") {
        var rowsCreate = this._getActiveRows();
        var selectedRowsCreate = [];

        for (var i = 0; i < rowsCreate.length; i++) {
          if (rowsCreate[i].selected === true) {
            selectedRowsCreate.push(rowsCreate[i]);
          }
        }

        if (selectedIndex < 0 || selectedIndex >= selectedRowsCreate.length) {
          return "";
        }

        var rowCreate = selectedRowsCreate[selectedIndex];
        if (!rowCreate || rowCreate[fieldName] === undefined || rowCreate[fieldName] === null) {
          return "";
        }

        return String(rowCreate[fieldName]);
      }

      var visibleIndexes = this._getManagePagedIndexes();
      var selectedRowsManage = [];

      for (var j = 0; j < visibleIndexes.length; j++) {
        if (this._manageRows[visibleIndexes[j]].selected === true) {
          selectedRowsManage.push(this._manageRows[visibleIndexes[j]]);
        }
      }

      if (selectedIndex < 0 || selectedIndex >= selectedRowsManage.length) {
        return "";
      }

      var rowManage = selectedRowsManage[selectedIndex];
      if (!rowManage || rowManage[fieldName] === undefined || rowManage[fieldName] === null) {
        return "";
      }

      return String(rowManage[fieldName]);
    }

    getValidationErrors() {
      return JSON.stringify(this._validationErrors || []);
    }

    getValidationResult() {
      return this._validationResult || "false";
    }

    getLastEvent() {
      return this._lastEvent || "";
    }

    setGLAccountOptions(json) {
      this._glAccountOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setGlAccountOptions(json) {
      this.setGLAccountOptions(json);
    }

    setCostCenterOptions(json) {
      this._costCenterOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setProfitCenterOptions(json) {
      this._profitCenterOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setSegmentOptions(json) {
      this._segmentOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setHierarchyOptions(json) {
      this._hierarchyOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setManagementMappingOptions(json) {
      this._managementMappingOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setManagementSubMappingOptions(json) {
      this._managementSubMappingOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setGlAccountDropdownOptionsOnly(optionsStr) {
      try {
        var optionsArray = JSON.parse(optionsStr || "[]");

        if (!Array.isArray(optionsArray)) {
          optionsArray = [];
        }

        this._glAccountOptions = this._parseOptions(JSON.stringify(optionsArray));
        this._syncAll();
        this._refreshTable();
      } catch (e) {}
    }

    setCostCenterDropdownOptionsOnly(optionsStr) {
      try {
        var optionsArray = JSON.parse(optionsStr || "[]");

        if (!Array.isArray(optionsArray)) {
          optionsArray = [];
        }

        this._costCenterOptions = this._parseOptions(JSON.stringify(optionsArray));
        this._syncAll();
        this._refreshTable();
      } catch (e) {}
    }

    setProfitCenterDropdownOptionsOnly(optionsStr) {
      try {
        var optionsArray = JSON.parse(optionsStr || "[]");

        if (!Array.isArray(optionsArray)) {
          optionsArray = [];
        }

        this._profitCenterOptions = this._parseOptions(JSON.stringify(optionsArray));
        this._syncAll();
        this._refreshTable();
      } catch (e) {}
    }

    setSegmentDropdownOptionsOnly(optionsStr) {
      try {
        var optionsArray = JSON.parse(optionsStr || "[]");

        if (!Array.isArray(optionsArray)) {
          optionsArray = [];
        }

        this._segmentOptions = this._parseOptions(JSON.stringify(optionsArray));
        this._syncAll();
        this._refreshTable();
      } catch (e) {}
    }

    setManageGlAccountFilter(filterStr) {
      try {
        var filterArray = JSON.parse(filterStr || "[]");

        if (!Array.isArray(filterArray)) {
          filterArray = [];
        }

        var cleanedFilter = [];
        var i = 0;

        for (i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);

          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageGlAccountFilter = cleanedFilter;
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageGlAccountFilter = [];
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      }
    }

    setManageCostCenterFilter(filterStr) {
      try {
        var filterArray = JSON.parse(filterStr || "[]");

        if (!Array.isArray(filterArray)) {
          filterArray = [];
        }

        var cleanedFilter = [];
        var i = 0;

        for (i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);

          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageCostCenterFilter = cleanedFilter;
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageCostCenterFilter = [];
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      }
    }

    setManageProfitCenterFilter(filterStr) {
      try {
        var filterArray = JSON.parse(filterStr || "[]");

        if (!Array.isArray(filterArray)) {
          filterArray = [];
        }

        var cleanedFilter = [];
        var i = 0;

        for (i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);

          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageProfitCenterFilter = cleanedFilter;
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageProfitCenterFilter = [];
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      }
    }

    setManageSegmentFilter(filterStr) {
      try {
        var filterArray = JSON.parse(filterStr || "[]");

        if (!Array.isArray(filterArray)) {
          filterArray = [];
        }

        var cleanedFilter = [];
        var i = 0;

        for (i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);

          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageSegmentFilter = cleanedFilter;
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageSegmentFilter = [];
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      }
    }

    setManageIdSearch(value) {
      this._manageIdSearch = this._safeString(value);
      this._manageCurrentPage = 1;
      this._rebuildManageFilteredIndexes();
      this._renderVisibleOnly();
    }

    setRowFieldOptions(rowIndex, fieldName, json) {
      var index = parseInt(rowIndex, 10);
      if (isNaN(index) || index < 0) {
        return;
      }

      var field = this._safeString(fieldName);
      if (!field) {
        return;
      }

      var parsed = this._parseOptions(json);
      this._setRowOptionsForField("create", index, field, parsed);

      if (this._rows[index]) {
        var currentValue = this._safeString(this._rows[index][field]);
        var keepValue = false;

        for (var i = 0; i < parsed.length; i++) {
          if (String(parsed[i].key) === currentValue) {
            keepValue = true;
            break;
          }
        }

        if (currentValue !== "" && keepValue === false) {
          this._rows[index][field] = "";
          if (field !== "ID") {
            this._rows[index].isModified = true;
            this._rows[index].rowStatus = "CHANGED";
            this._updateRowId(this._rows[index]);
          }
        }
      }

      this._syncAll();
      this._refreshTable();
    }

    setManageRowFieldOptions(rowIndex, fieldName, json) {
      var index = parseInt(rowIndex, 10);
      if (isNaN(index) || index < 0) {
        return;
      }

      var field = this._safeString(fieldName);
      if (!field) {
        return;
      }

      var parsed = this._parseOptions(json);
      this._setRowOptionsForField("manage", index, field, parsed);

      if (this._manageRows[index]) {
        var currentValue = this._safeString(this._manageRows[index][field]);
        var keepValue = false;

        for (var i = 0; i < parsed.length; i++) {
          if (String(parsed[i].key) === currentValue) {
            keepValue = true;
            break;
          }
        }

        if (currentValue !== "" && keepValue === false) {
          this._manageRows[index][field] = "";
          if (field !== "ID") {
            this._manageRows[index].isModified = true;
            this._manageRows[index].rowStatus = "CHANGED";
          }
        }
      }

      this._syncAll();
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setVisible(flag) {
      this.style.display = flag ? "block" : "none";
    }
  }

  if (!customElements.get("com-company-managementwidget")) {
    customElements.define("com-company-managementwidget", ProjectEntryWidget);
  }

  (function () {
    if (document.getElementById("project-widget-dropdown-global-style")) {
      return;
    }

    var globalStyleEl = document.createElement("style");
    globalStyleEl.id = "project-widget-dropdown-global-style";
    globalStyleEl.textContent =
      '.project-widget-dropdown-panel {' +
        'background:#ffffff;' +
        'border:1px solid #cfd9e3;' +
        'border-radius:8px;' +
        'box-shadow:0 8px 24px rgba(34,53,72,0.18);' +
        'overflow:hidden;' +
        'min-width:220px;' +
        'max-width:460px;' +
        'max-height:360px;' +
        'z-index:999999;' +
        'font-family:"72", Arial, sans-serif;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-search-wrap {' +
        'padding:8px;' +
        'border-bottom:1px solid #e8eef5;' +
        'background:#ffffff;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-search-input {' +
        'width:100%;' +
        'height:32px;' +
        'border:1px solid #b9cae0;' +
        'border-radius:6px;' +
        'padding:0 10px;' +
        'box-sizing:border-box;' +
        'font-size:13px;' +
        'outline:none;' +
        'color:#223548;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-search-input:focus {' +
        'border-color:#0a6ed1;' +
        'box-shadow:0 0 0 2px rgba(10,110,209,0.12);' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-list {' +
        'max-height:300px;' +
        'overflow:auto;' +
        'background:#ffffff;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-item {' +
        'padding:9px 10px;' +
        'font-size:13px;' +
        'color:#223548;' +
        'cursor:pointer;' +
        'border-bottom:1px solid #f3f6f9;' +
        'line-height:1.35;' +
        'word-break:break-word;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-item:hover {' +
        'background:#edf5ff;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-item.selected {' +
        'background:#e8f2ff;' +
        'color:#0a6ed1;' +
        'font-weight:600;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-empty {' +
        'padding:12px;' +
        'color:#7b8a9a;' +
        'text-align:center;' +
        'font-size:13px;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-more {' +
        'padding:8px 10px;' +
        'font-size:12px;' +
        'color:#6b7c8f;' +
        'text-align:center;' +
        'background:#fafcff;' +
        'border-top:1px solid #eef3f8;' +
        'position:sticky;' +
        'bottom:0;' +
      '}';
    document.head.appendChild(globalStyleEl);
  })();
})();
*/
(function () {
  class ProjectEntryWidget extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });

      this._activeTab = "create";

      this._rows = [];
      this._manageRows = [];

      this._validationErrors = [];
      this._validationResult = "true";
      this._lastEvent = "";
      this._savePayload = [];
      this._widgetStatus = "READY";
      this._rowSequence = 1;

      this._glAccountOptions = [];
      this._costCenterOptions = [];
      this._profitCenterOptions = [];
      this._segmentOptions = [];
      this._hierarchyOptions = [];
      this._managementMappingOptions = [];
      this._managementSubMappingOptions = [];

      this._rowOptions = {};
      this._manageRowOptions = {};

      this._manageGlAccountFilter = [];
      this._manageCostCenterFilter = [];
      this._manageProfitCenterFilter = [];
      this._manageSegmentFilter = [];

      this._manageIdSearch = "";
      this._filteredManageIndexes = [];
      this._managePageSize = 100;
      this._manageCurrentPage = 1;

      this._dropdownPanel = null;
      this._dropdownSearch = null;
      this._dropdownList = null;
      this._dropdownOpen = false;
      this._activeDropdownTrigger = null;
      this._activeDropdownTab = "create";
      this._activeDropdownRow = -1;
      this._activeDropdownField = "";
      this._activeDropdownOptions = [];
      this._activeDropdownSelectedKey = "";
      this._dropdownClearWrap = null;
      this._dropdownClearBtn = null;
      this._dropdownCloseBtn = null;

      this._filteredDropdownOptions = [];
      this._dropdownBatchSize = 100;
      this._dropdownRenderedCount = 0;
      this._dropdownSearchTimer = null;
      this._dropdownListMoreEl = null;

      this._createColumns = [
        { key: "selected", label: "Sel", type: "checkbox", width: "70px" },
        { key: "GLACCOUNT", label: "GLACCOUNT", type: "select", width: "180px" },
        { key: "COSTCENTER", label: "COSTCENTER", type: "select", width: "180px" },
        { key: "PROFITCENTER", label: "PROFITCENTER", type: "select", width: "180px" },
        { key: "SEGMENT", label: "SEGMENT", type: "select", width: "140px" },
        { key: "ID", label: "ID", type: "readonly", width: "210px" },
        { key: "MANAGEMENT_SUB_MAPPING", label: "MANAGEMENT SUB-MAPPING", type: "select", width: "250px" },
        { key: "MANAGEMENT_MAPPING", label: "MANAGEMENT MAPPING", type: "select", width: "230px" },
        { key: "Hierarchy", label: "Hierarchy", type: "select", width: "180px" }
      ];

      this._manageColumns = [
        { key: "selected", label: "Sel", type: "checkbox", width: "70px" },
        { key: "ID", label: "ID", type: "readonly", width: "210px" },
        { key: "GLACCOUNT", label: "GLACCOUNT", type: "select", width: "180px" },
        { key: "COSTCENTER", label: "COSTCENTER", type: "select", width: "180px" },
        { key: "PROFITCENTER", label: "PROFITCENTER", type: "select", width: "180px" },
        { key: "SEGMENT", label: "SEGMENT", type: "select", width: "140px" },
        { key: "MANAGEMENT_SUB_MAPPING", label: "MANAGEMENT SUB-MAPPING", type: "select", width: "250px" },
        { key: "MANAGEMENT_MAPPING", label: "MANAGEMENT MAPPING", type: "select", width: "230px" },
        { key: "Hierarchy", label: "Hierarchy", type: "select", width: "180px" }
      ];

      this._render();
    }

    connectedCallback() {
      if (!this._rows || this._rows.length === 0) {
        this._rows = [this._createEmptyRow("NEW")];
      }

      this._createDropdownPanel();
      this._normalizeAllRows(this._rows, "NEW");
      this._normalizeAllRows(this._manageRows, "LOADED");
      this._cleanupRowOptions("create");
      this._cleanupRowOptions("manage");
      this._rebuildManageFilteredIndexes();
      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onReady", { status: "ready" });
    }

    disconnectedCallback() {
      this._closeDropdown();

      if (this._dropdownPanel && this._dropdownPanel.parentNode) {
        this._dropdownPanel.parentNode.removeChild(this._dropdownPanel);
      }

      if (this._documentClickHandler) {
        document.removeEventListener("click", this._documentClickHandler);
      }

      this._dropdownPanel = null;
    }

    static get observedAttributes() {
      return [
        "rows",
        "managedata",
        "activetab",
        "lastEvent",
        "validationResult",
        "validationErrors",
        "savePayload",
        "rowCount",
        "selectedRowCount",
        "widgetStatus",
        "glAccountOptions",
        "costCenterOptions",
        "profitCenterOptions",
        "segmentOptions",
        "hierarchyOptions",
        "managementMappingOptions",
        "managementSubMappingOptions",
        "manageGlAccountFilter",
        "manageCostCenterFilter",
        "manageProfitCenterFilter",
        "manageSegmentFilter"
      ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }

      if (name === "rows") {
        this.setRows(newValue || "[]");
        return;
      }

      if (name === "managedata") {
        this.setManageData(newValue || "[]");
        return;
      }

      if (name === "activetab") {
        this.setActiveTab(newValue || "create");
        return;
      }

      if (name === "glAccountOptions") {
        this._glAccountOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "costCenterOptions") {
        this._costCenterOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "profitCenterOptions") {
        this._profitCenterOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "segmentOptions") {
        this._segmentOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "hierarchyOptions") {
        this._hierarchyOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "managementMappingOptions") {
        this._managementMappingOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "managementSubMappingOptions") {
        this._managementSubMappingOptions = this._parseOptions(newValue);
        this._refreshTable();
        return;
      }

      if (name === "manageGlAccountFilter") {
        this.setManageGlAccountFilter(newValue || "[]");
        return;
      }

      if (name === "manageCostCenterFilter") {
        this.setManageCostCenterFilter(newValue || "[]");
        return;
      }

      if (name === "manageProfitCenterFilter") {
        this.setManageProfitCenterFilter(newValue || "[]");
        return;
      }

      if (name === "manageSegmentFilter") {
        this.setManageSegmentFilter(newValue || "[]");
        return;
      }
    }

    _createEmptyRow(defaultStatus) {
      return {
        rowId: "ROW_" + String(this._rowSequence++),
        selected: false,
        isModified: false,
        rowStatus: defaultStatus || "NEW",
        GLACCOUNT: "",
        COSTCENTER: "",
        PROFITCENTER: "",
        SEGMENT: "",
        ID: "",
        MANAGEMENT_SUB_MAPPING: "",
        MANAGEMENT_MAPPING: "",
        Hierarchy: ""
      };
    }

    _getRowsByTab(tabName) {
      return tabName === "manage" ? this._manageRows : this._rows;
    }

    _getRowOptionsBucketByTab(tabName) {
      return tabName === "manage" ? this._manageRowOptions : this._rowOptions;
    }

    _setRowOptionsBucketByTab(tabName, value) {
      if (tabName === "manage") {
        this._manageRowOptions = value;
      } else {
        this._rowOptions = value;
      }
    }

    _normalizeRow(row, defaultStatus) {
      if (!row.rowId) {
        row.rowId = "ROW_" + String(this._rowSequence++);
      }

      if (row.selected !== true) {
        row.selected = false;
      }

      if (row.isModified !== true) {
        row.isModified = false;
      }

      if (!row.rowStatus) {
        row.rowStatus = defaultStatus || "LOADED";
      }

      row.GLACCOUNT = this._safeString(row.GLACCOUNT);
      row.COSTCENTER = this._safeString(row.COSTCENTER);
      row.PROFITCENTER = this._safeString(row.PROFITCENTER);
      row.SEGMENT = this._safeString(row.SEGMENT);
      row.ID = this._safeString(row.ID);
      row.MANAGEMENT_SUB_MAPPING = this._safeString(row.MANAGEMENT_SUB_MAPPING);
      row.MANAGEMENT_MAPPING = this._safeString(row.MANAGEMENT_MAPPING);
      row.Hierarchy = this._safeString(row.Hierarchy);

      if (!row.ID || row.ID === "") {
        this._updateRowId(row);
      }
    }

    _normalizeAllRows(rows, defaultStatus) {
      var sourceRows = rows || [];
      for (var i = 0; i < sourceRows.length; i++) {
        this._normalizeRow(sourceRows[i], defaultStatus);
      }
    }

    _safeString(value) {
      if (value === undefined || value === null) {
        return "";
      }
      return String(value).trim();
    }

    _escape(value) {
      if (value === undefined || value === null) {
        return "";
      }
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    _escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    _parseOptions(json) {
      try {
        var arr = JSON.parse(json || "[]");
        if (!Array.isArray(arr)) {
          return [];
        }

        var normalized = [];
        for (var i = 0; i < arr.length; i++) {
          var item = arr[i];

          if (item && typeof item === "object") {
            var key = item.key !== undefined && item.key !== null ? String(item.key) : "";
            var text = item.text !== undefined && item.text !== null ? String(item.text) : key;
            normalized.push({
              key: key,
              text: text,
              searchText: (key + " " + text).toLowerCase()
            });
          } else {
            var val = item !== undefined && item !== null ? String(item) : "";
            normalized.push({
              key: val,
              text: val,
              searchText: val.toLowerCase()
            });
          }
        }

        return normalized;
      } catch (e) {
        return [];
      }
    }

    _cloneOptions(options) {
      var cloned = [];
      if (!options || !options.length) {
        return cloned;
      }

      for (var i = 0; i < options.length; i++) {
        cloned.push({
          key: options[i].key,
          text: options[i].text,
          searchText: options[i].searchText
        });
      }
      return cloned;
    }

    _ensureRowOptionBucket(tabName, rowIndex) {
      var bucket = this._getRowOptionsBucketByTab(tabName);
      if (!bucket[rowIndex]) {
        bucket[rowIndex] = {};
      }
    }

    _getRowOptionsForField(tabName, rowIndex, fieldName) {
      var bucket = this._getRowOptionsBucketByTab(tabName);
      if (
        bucket &&
        bucket[rowIndex] &&
        bucket[rowIndex][fieldName] &&
        Array.isArray(bucket[rowIndex][fieldName])
      ) {
        return bucket[rowIndex][fieldName];
      }
      return null;
    }

    _setRowOptionsForField(tabName, rowIndex, fieldName, options) {
      this._ensureRowOptionBucket(tabName, rowIndex);
      var bucket = this._getRowOptionsBucketByTab(tabName);
      bucket[rowIndex][fieldName] = this._cloneOptions(options || []);
    }

    _rebuildRowOptionsAfterRowChange(tabName, oldRows, newRows) {
      var oldMap = {};
      var newMap = {};
      var rebuilt = {};
      var bucket = this._getRowOptionsBucketByTab(tabName);
      var i = 0;

      for (i = 0; i < oldRows.length; i++) {
        if (oldRows[i] && oldRows[i].rowId) {
          oldMap[oldRows[i].rowId] = i;
        }
      }

      for (i = 0; i < newRows.length; i++) {
        if (newRows[i] && newRows[i].rowId) {
          newMap[newRows[i].rowId] = i;
        }
      }

      for (var rowId in newMap) {
        if (oldMap[rowId] !== undefined && bucket[oldMap[rowId]]) {
          rebuilt[newMap[rowId]] = this._cloneRowFieldOptions(bucket[oldMap[rowId]]);
        }
      }

      this._setRowOptionsBucketByTab(tabName, rebuilt);
    }

    _cloneRowFieldOptions(rowFieldOptions) {
      var result = {};
      if (!rowFieldOptions) {
        return result;
      }

      for (var fieldName in rowFieldOptions) {
        result[fieldName] = this._cloneOptions(rowFieldOptions[fieldName] || []);
      }

      return result;
    }

    _cleanupRowOptions(tabName) {
      var rebuilt = {};
      var rows = this._getRowsByTab(tabName);
      var bucket = this._getRowOptionsBucketByTab(tabName);

      for (var i = 0; i < rows.length; i++) {
        if (bucket[i]) {
          rebuilt[i] = this._cloneRowFieldOptions(bucket[i]);
        }
      }

      this._setRowOptionsBucketByTab(tabName, rebuilt);
    }

    _updateRowId(row) {
      var parts = [];

      if (row.GLACCOUNT) parts.push(row.GLACCOUNT);
      if (row.COSTCENTER) parts.push(row.COSTCENTER);
      if (row.PROFITCENTER) parts.push(row.PROFITCENTER);
      if (row.SEGMENT) parts.push(row.SEGMENT);

      row.ID = parts.join("-");
    }

    _render() {
      this._shadowRoot.innerHTML = `
        <style>
          :host { display:block; font-family:"72", Arial, sans-serif; color:#223548; }
          .wrap { border:1px solid #d9e2ef; border-radius:12px; background:#ffffff; overflow:hidden; }
          .tabbar { display:flex; gap:0; border-bottom:1px solid #dfe8f2; background:#f8fbff; }
          .tabbtn { border:none; background:transparent; padding:14px 18px; cursor:pointer; font-weight:700; font-size:13px; color:#5d7288; border-bottom:3px solid transparent; }
          .tabbtn.active { color:#0a6ed1; border-bottom-color:#0a6ed1; background:#ffffff; }

          .toolbarWrap { display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px; border-bottom:1px solid #e5edf7; background:#f8fbff; flex-wrap:wrap; }
          .toolbarLeft { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
          .toolbarRight { display:flex; justify-content:flex-end; gap:8px; flex-wrap:wrap; margin-left:auto; }

          .searchBox {
            width:260px;
            max-width:100%;
            height:36px;
            border:1px solid #c7d7ea;
            background:#ffffff;
            color:#223548;
            border-radius:8px;
            padding:0 12px;
            font-size:13px;
            outline:none;
          }

          .searchBox:focus {
            border-color:#0a6ed1;
            box-shadow:0 0 0 2px rgba(10,110,209,0.12);
          }

          .btn { border:1px solid #c7d7ea; background:#ffffff; color:#0a6ed1; border-radius:8px; padding:8px 14px; cursor:pointer; font-weight:600; font-size:13px; }
          .btn:hover { background:#f3f8fd; }
          .btn.primary { background:#0a6ed1; color:#ffffff; border-color:#0a6ed1; }
          .btn.danger { color:#bb1e1e; border-color:#efb4b4; background:#fff7f7; }

          .gridWrap { overflow:auto; max-height:520px; background:#ffffff; }
          table { border-collapse:separate; border-spacing:0; width:max-content; min-width:100%; }
          th, td { border-bottom:1px solid #edf2f7; padding:8px; vertical-align:top; white-space:nowrap; box-sizing:border-box; }
          th { position:sticky; top:0; background:#eef4fb; z-index:2; text-align:left; font-size:12px; color:#223548; font-weight:700; }
          tr:hover td { background:#fafcff; }
          tr.errorRow td { background:#fff7f7; }
          tr.modifiedRow td { background:#fffbeb; }

          .readonly-cell {
            width:100%;
            min-height:34px;
            height:34px;
            border:1px solid #d6dee8;
            border-radius:6px;
            padding:6px 10px;
            font-size:13px;
            background:#f6f8fb;
            color:#425466;
            box-sizing:border-box;
            display:flex;
            align-items:center;
          }

          .dropdown-trigger {
            width:100%;
            min-height:34px;
            height:34px;
            border:1px solid #c9d6e5;
            border-radius:6px;
            background:#fff;
            display:flex;
            align-items:center;
            justify-content:space-between;
            box-sizing:border-box;
            padding:0 10px;
            cursor:pointer;
            font-size:13px;
            color:#223548;
            user-select:none;
          }

          .dropdown-trigger .label {
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
            padding-right:8px;
          }

          .dropdown-trigger .arrow {
            color:#6a7f94;
            font-size:11px;
            flex:0 0 auto;
          }

          .dropdown-trigger.error {
            border-color:#e25555;
            background:#fff5f5;
          }

          .rowErr { margin-top:4px; font-size:11px; color:#c53030; white-space:normal; max-width:240px; line-height:1.3; }
          .summary { padding:10px 12px; border-top:1px solid #e5edf7; display:flex; gap:18px; font-size:12px; background:#fafcff; flex-wrap:wrap; }
          .row-checkbox { width:22px; height:22px; cursor:pointer; margin-top:8px; }
          .select-all-wrap { display:flex; align-items:center; gap:6px; }
          .select-all-checkbox { width:16px; height:16px; cursor:pointer; }
          .muted { font-size:12px; color:#6b7c93; }
          .pager { display:flex; justify-content:flex-end; align-items:center; gap:8px; padding:8px 12px; border-bottom:1px solid #e5edf7; background:#ffffff; }
          .empty-msg { padding:40px; text-align:center; color:#8a9bb0; font-size:14px; }
        </style>
        <div class="wrap" id="widgetWrap"></div>
      `;
    }

    _getActiveRows() {
      return this._activeTab === "manage" ? this._manageRows : this._rows;
    }

    _hasSelectedRows(tabName) {
      var rows = this._getRowsByTab(tabName);
      if (tabName !== "manage") {
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].selected === true) { return true; }
        }
        return false;
      }

      var visibleIndexes = this._getManagePagedIndexes();
      for (var j = 0; j < visibleIndexes.length; j++) {
        if (rows[visibleIndexes[j]].selected === true) { return true; }
      }
      return false;
    }

    _areAllRowsSelected(tabName) {
      var rows = this._getRowsByTab(tabName);

      if (!rows || rows.length === 0) {
        return false;
      }

      if (tabName !== "manage") {
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].selected !== true) {
            return false;
          }
        }
        return rows.length > 0;
      }

      var visibleIndexes = this._getManagePagedIndexes();
      if (!visibleIndexes.length) { return false; }

      for (var j = 0; j < visibleIndexes.length; j++) {
        if (rows[visibleIndexes[j]].selected !== true) {
          return false;
        }
      }

      return true;
    }

    _toggleSelectAll(tabName, checked) {
      var rows = this._getRowsByTab(tabName);

      if (tabName !== "manage") {
        for (var i = 0; i < rows.length; i++) {
          rows[i].selected = checked;
        }
      } else {
        var visibleIndexes = this._getManagePagedIndexes();
        for (var j = 0; j < visibleIndexes.length; j++) {
          rows[visibleIndexes[j]].selected = checked;
          rows[visibleIndexes[j]].isModified = true;
          rows[visibleIndexes[j]].rowStatus = "CHANGED";
        }
      }

      this._validationErrors = [];
      this._validationResult = "true";
      this._lastEvent = JSON.stringify({
        type: tabName === "manage" ? "manageSelectAll" : "selectAll",
        selected: checked
      });
      this._widgetStatus = "CHANGED";
      this._syncAll();
      this._refreshToolbarButtons();
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
      this._fireSimpleEvent("onDataChange", {
        activeTab: this._activeTab,
        rows: this._rows,
        manageRows: this._manageRows
      });
    }

    _refreshStatusBarHtml() {
      return `
        <div class="summary" id="summaryBar">
          <div>Active Tab: ${this._activeTab}</div>
          <div>Total Rows: ${this.getVisibleRowCount()}</div>
          <div>Selected Rows: ${this.getSelectedRowCount()}</div>
          <div>Validation: ${this._validationResult}</div>
          <div>Status: ${this._widgetStatus}</div>
        </div>
      `;
    }

    _refreshSummaryOnly() {
      var summaryHost = this._shadowRoot.getElementById("summaryBar");
      if (summaryHost) {
        summaryHost.outerHTML = this._refreshStatusBarHtml();
      }

      var visibleText = this._shadowRoot.getElementById("visibleCountText");
      if (visibleText) {
        visibleText.textContent = "Visible: " + this.getVisibleRowCount();
      }

      var pageInfo = this._shadowRoot.getElementById("pageInfo");
      if (pageInfo) {
        pageInfo.textContent = "Page " + this._getManageCurrentPage() + " of " + this._getManageTotalPages();
      }

      var loadMoreInfo = this._shadowRoot.getElementById("loadMoreInfo");
      if (loadMoreInfo) {
        var total = this.getVisibleRowCount();
        var start = total === 0 ? 0 : ((this._getManageCurrentPage() - 1) * this._managePageSize) + 1;
        var end = Math.min(this._getManageCurrentPage() * this._managePageSize, total);
        loadMoreInfo.textContent = "Showing " + start + " to " + end + " of " + total;
      }
    }

    _isValueInFilter(filterArray, value) {
      if (!filterArray || filterArray.length === 0) {
        return true;
      }

      var cleanValue = this._safeString(value);
      var i = 0;

      for (i = 0; i < filterArray.length; i++) {
        if (this._safeString(filterArray[i]) === cleanValue) {
          return true;
        }
      }

      return false;
    }

    _isManageRowVisible(rowData) {
      if (!rowData) {
        return false;
      }

      if (!this._isValueInFilter(this._manageGlAccountFilter, rowData.GLACCOUNT)) {
        return false;
      }

      if (!this._isValueInFilter(this._manageCostCenterFilter, rowData.COSTCENTER)) {
        return false;
      }

      if (!this._isValueInFilter(this._manageProfitCenterFilter, rowData.PROFITCENTER)) {
        return false;
      }

      if (!this._isValueInFilter(this._manageSegmentFilter, rowData.SEGMENT)) {
        return false;
      }

      if (this._manageIdSearch && this._manageIdSearch !== "") {
        var rowIdText = this._safeString(rowData.ID).toLowerCase();
        var searchText = this._safeString(this._manageIdSearch).toLowerCase();

        if (rowIdText.indexOf(searchText) === -1) {
          return false;
        }
      }

      return true;
    }

    _rebuildManageFilteredIndexes() {
      this._filteredManageIndexes = [];
      for (var i = 0; i < this._manageRows.length; i++) {
        if (this._isManageRowVisible(this._manageRows[i])) {
          this._filteredManageIndexes.push(i);
        }
      }

      var totalPages = this._getManageTotalPages();
      if (this._manageCurrentPage > totalPages) {
        this._manageCurrentPage = totalPages;
      }
      if (this._manageCurrentPage < 1) {
        this._manageCurrentPage = 1;
      }
    }

    _getManageTotalPages() {
      if (this._filteredManageIndexes.length === 0) { return 1; }
      return Math.ceil(this._filteredManageIndexes.length / this._managePageSize);
    }

    _getManagePagedIndexes() {
      var start = (this._manageCurrentPage - 1) * this._managePageSize;
      var end = start + this._managePageSize;
      return this._filteredManageIndexes.slice(start, end);
    }

    _getManageCurrentPage() {
      if (this._activeTab !== "manage") { return 1; }
      return this._manageCurrentPage;
    }

    _goToPreviousPage() {
      if (this._activeTab !== "manage") { return; }
      if (this._manageCurrentPage > 1) {
        this._manageCurrentPage--;
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
      }
    }

    _goToNextPage() {
      if (this._activeTab !== "manage") { return; }
      if (this._manageCurrentPage < this._getManageTotalPages()) {
        this._manageCurrentPage++;
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
      }
    }

    getVisibleRowCount() {
      if (this._activeTab !== "manage") {
        return this._rows.length;
      }
      return this._filteredManageIndexes.length;
    }

    _renderVisibleOnly() {
      var tbody = this._shadowRoot.getElementById("tbodyVirtual");
      if (!tbody) { return; }

      var rowErrorMap = this._getRowErrorMap();
      var html = "";
      var i = 0;
      var j = 0;
      var activeColumns = this._activeTab === "manage" ? this._manageColumns : this._createColumns;
      var visibleIndexes = this._activeTab === "manage"
        ? this._getManagePagedIndexes()
        : (function(length) {
            var arr = [];
            for (var k = 0; k < length; k++) { arr.push(k); }
            return arr;
          }.call(this, this._rows.length));

      if (visibleIndexes.length === 0) {
        var colCount = activeColumns.length;
        html = '<tr><td colspan="' + colCount + '" class="empty-msg">No data to display.</td></tr>';
        tbody.innerHTML = html;
        this._refreshSummaryOnly();
        return;
      }

      for (i = 0; i < visibleIndexes.length; i++) {
        var actualIndex = visibleIndexes[i];
        var sourceRows = this._activeTab === "manage" ? this._manageRows : this._rows;
        var row = sourceRows[actualIndex];
        var rowErrors = rowErrorMap[actualIndex] || [];
        var rowClass = "";

        if (rowErrors.length) {
          rowClass = "errorRow";
        } else if (row.isModified === true) {
          rowClass = "modifiedRow";
        }

        html += '<tr class="' + rowClass + '">';

        for (j = 0; j < activeColumns.length; j++) {
          html += '<td style="width:' + activeColumns[j].width + '">'
            + this._renderCell(this._activeTab, row, actualIndex, activeColumns[j], rowErrors)
            + '</td>';
        }

        html += '</tr>';
      }

      tbody.innerHTML = html;
      this._bindCellEvents();

      var selectAll = this._shadowRoot.getElementById(this._activeTab === "manage" ? "selectAllManage" : "selectAllCreate");
      if (selectAll) { selectAll.checked = this._areAllRowsSelected(this._activeTab); }

      this._refreshSummaryOnly();
    }

    _refreshToolbarButtons() {
      var hasSelection = this._hasSelectedRows(this._activeTab);
      var toolbarRight = this._shadowRoot.getElementById("toolbarRight");
      if (!toolbarRight) { return; }

      if (this._activeTab === "create") {
        var existingDeleteCreate = this._shadowRoot.getElementById("btnDelete");
        if (hasSelection && !existingDeleteCreate) {
          var newDeleteBtnCreate = document.createElement("button");
          newDeleteBtnCreate.className = "btn danger";
          newDeleteBtnCreate.id = "btnDelete";
          newDeleteBtnCreate.textContent = "Delete Selected";
          newDeleteBtnCreate.addEventListener("click", this.deleteSelectedRows.bind(this));
          var btnValidate = this._shadowRoot.getElementById("btnValidate");
          if (btnValidate) {
            toolbarRight.insertBefore(newDeleteBtnCreate, btnValidate);
          } else {
            toolbarRight.appendChild(newDeleteBtnCreate);
          }
        } else if (!hasSelection && existingDeleteCreate) {
          existingDeleteCreate.parentNode.removeChild(existingDeleteCreate);
        }

        var existingCopyCreate = this._shadowRoot.getElementById("btnCopy");
        if (hasSelection && !existingCopyCreate) {
          var newCopyBtnCreate = document.createElement("button");
          newCopyBtnCreate.className = "btn";
          newCopyBtnCreate.id = "btnCopy";
          newCopyBtnCreate.textContent = "Copy";
          newCopyBtnCreate.addEventListener("click", this.copySelectedRows.bind(this));
          var btnDeleteRef = this._shadowRoot.getElementById("btnDelete") || this._shadowRoot.getElementById("btnValidate");
          if (btnDeleteRef) {
            toolbarRight.insertBefore(newCopyBtnCreate, btnDeleteRef);
          } else {
            toolbarRight.appendChild(newCopyBtnCreate);
          }
        } else if (!hasSelection && existingCopyCreate) {
          existingCopyCreate.parentNode.removeChild(existingCopyCreate);
        }
      } else {
        var existingDeleteManage = this._shadowRoot.getElementById("btnDeleteManage");
        if (hasSelection && !existingDeleteManage) {
          var newDeleteBtnManage = document.createElement("button");
          newDeleteBtnManage.className = "btn danger";
          newDeleteBtnManage.id = "btnDeleteManage";
          newDeleteBtnManage.textContent = "Delete Selected";
          newDeleteBtnManage.addEventListener("click", this.deleteManageData.bind(this));
          var btnClearManage = this._shadowRoot.getElementById("btnClearManage");
          if (btnClearManage) {
            toolbarRight.insertBefore(newDeleteBtnManage, btnClearManage);
          } else {
            toolbarRight.appendChild(newDeleteBtnManage);
          }
        } else if (!hasSelection && existingDeleteManage) {
          existingDeleteManage.parentNode.removeChild(existingDeleteManage);
        }
      }
    }

    _refreshTable() {
      var container = this._shadowRoot.getElementById("widgetWrap");
      var hasSelection = this._hasSelectedRows(this._activeTab);
      var allSelected = this._areAllRowsSelected(this._activeTab);
      var selectAllId = this._activeTab === "manage" ? "selectAllManage" : "selectAllCreate";
      var activeColumns = this._activeTab === "manage" ? this._manageColumns : this._createColumns;

      if (this._activeTab === "manage") {
        this._rebuildManageFilteredIndexes();
      }

      var html = '';
      html += '<div class="tabbar">';
      html += '<button class="tabbtn ' + (this._activeTab === 'create' ? 'active' : '') + '" id="tabCreate">Create Mapping</button>';
      html += '<button class="tabbtn ' + (this._activeTab === 'manage' ? 'active' : '') + '" id="tabManage">Manage Mapping</button>';
      html += '</div>';

      html += '<div class="toolbarWrap">';
      if (this._activeTab === "create") {
        html += '<div class="toolbarLeft"></div>';
        html += '<div class="toolbarRight" id="toolbarRight">';
        html += '<button class="btn" id="btnAdd">Add Row</button>';

        if (hasSelection) {
          html += '<button class="btn" id="btnCopy">Copy</button>';
          html += '<button class="btn danger" id="btnDelete">Delete Selected</button>';
        }

        html += '<button class="btn" id="btnValidate">Validate</button>';
        html += '<button class="btn primary" id="btnSave">Save</button>';
        html += '<button class="btn" id="btnClear">Clear</button>';
        html += '</div>';
      } else {
        html += '<div class="toolbarLeft">';
        html += '<input class="searchBox" id="manageIdSearch" type="text" placeholder="Search ID..." value="' + this._escape(this._manageIdSearch || "") + '" />';
        html += '<span class="muted" id="visibleCountText">Visible: ' + this.getVisibleRowCount() + '</span>';
        html += '</div>';

        html += '<div class="toolbarRight" id="toolbarRight">';
        html += '<button class="btn" id="btnLoadManage">Load Data</button>';
        html += '<button class="btn primary" id="btnSaveManage">Save Changes</button>';

        if (hasSelection) {
          html += '<button class="btn danger" id="btnDeleteManage">Delete Selected</button>';
        }

        html += '<button class="btn" id="btnClearManage">Clear</button>';
        html += '</div>';
      }
      html += '</div>';

      if (this._activeTab === "manage") {
        html += '<div class="pager">';
        html += '<span class="muted" id="loadMoreInfo">Showing '
          + (this.getVisibleRowCount() === 0 ? 0 : (((this._manageCurrentPage - 1) * this._managePageSize) + 1))
          + ' to '
          + Math.min(this._manageCurrentPage * this._managePageSize, this.getVisibleRowCount())
          + ' of ' + this.getVisibleRowCount() + '</span>';
        html += '<button class="btn" id="btnPrevPage">Previous</button>';
        html += '<span class="muted" id="pageInfo">Page ' + this._manageCurrentPage + ' of ' + this._getManageTotalPages() + '</span>';
        html += '<button class="btn" id="btnNextPage">Next</button>';
        html += '</div>';
      }

      html += '<div class="gridWrap" id="gridWrap">';
      html += '<table>';
      html += '<thead><tr>';

      for (var h = 0; h < activeColumns.length; h++) {
        var col = activeColumns[h];
        if (col.key === "selected") {
          html += '<th style="width:' + col.width + '"><div class="select-all-wrap"><span>Sel</span><input class="select-all-checkbox" type="checkbox" id="' + selectAllId + '" ' + (allSelected ? 'checked' : '') + ' /></div></th>';
        } else {
          html += '<th style="width:' + col.width + '">' + col.label + '</th>';
        }
      }

      html += '</tr></thead><tbody id="tbodyVirtual"></tbody>';
      html += '</table></div>';
      html += this._refreshStatusBarHtml();

      var oldGrid = this._shadowRoot.getElementById("gridWrap");
      var oldLeft = oldGrid ? oldGrid.scrollLeft : 0;
      var oldTop = oldGrid ? oldGrid.scrollTop : 0;

      container.innerHTML = html;
      this._bindEvents();
      this._renderVisibleOnly();

      var newGrid = this._shadowRoot.getElementById("gridWrap");
      if (newGrid) {
        newGrid.scrollLeft = oldLeft;
        newGrid.scrollTop = oldTop;
      }
    }

    _renderCell(tabName, row, rowIndex, column, rowErrors) {
      var value = row[column.key] !== undefined && row[column.key] !== null ? row[column.key] : "";
      var hasError = this._hasFieldError(column.key, rowErrors);
      var errorCss = hasError ? "error" : "";

      if (column.type === "checkbox") {
        return '<input class="row-checkbox ' + errorCss + '" data-tab="' + tabName + '" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="checkbox" type="checkbox" ' + (value === true ? 'checked' : '') + ' />';
      }

      if (column.type === "readonly") {
        return '<div class="readonly-cell" data-tab="' + tabName + '" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="readonly">' + this._escape(String(value)) + '</div>' + this._renderFieldErrors(column.key, rowErrors);
      }

      if (column.type === "select") {
        var displayText = this._getOptionText(tabName, column.key, value, rowIndex);
        if (!displayText) {
          displayText = "Select";
        }

        return ''
          + '<div class="dropdown-trigger ' + errorCss + '" tabindex="0" data-tab="' + tabName + '" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="select">'
          + '<span class="label">' + this._escape(String(displayText)) + '</span>'
          + '<span class="arrow">▼</span>'
          + '</div>'
          + this._renderFieldErrors(column.key, rowErrors);
      }

      return "";
    }

    _getGlobalOptionsForField(fieldName) {
      if (fieldName === "GLACCOUNT") return this._glAccountOptions || [];
      if (fieldName === "COSTCENTER") return this._costCenterOptions || [];
      if (fieldName === "PROFITCENTER") return this._profitCenterOptions || [];
      if (fieldName === "SEGMENT") return this._segmentOptions || [];
      if (fieldName === "Hierarchy") return this._hierarchyOptions || [];
      if (fieldName === "MANAGEMENT_MAPPING") return this._managementMappingOptions || [];
      if (fieldName === "MANAGEMENT_SUB_MAPPING") return this._managementSubMappingOptions || [];
      return [];
    }

    _getOptionsForField(tabName, fieldName, rowIndex) {
      var rowOptions = this._getRowOptionsForField(tabName, rowIndex, fieldName);
      if (rowOptions !== null) {
        return rowOptions;
      }
      return this._getGlobalOptionsForField(fieldName);
    }

    _getOptionText(tabName, fieldName, value, rowIndex) {
      var options = this._getOptionsForField(tabName, fieldName, rowIndex);
      var valueStr = String(value || "");

      for (var i = 0; i < options.length; i++) {
        if (String(options[i].key) === valueStr) {
          return options[i].text;
        }
      }

      var globalOptions = this._getGlobalOptionsForField(fieldName);
      for (var j = 0; j < globalOptions.length; j++) {
        if (String(globalOptions[j].key) === valueStr) {
          return globalOptions[j].text;
        }
      }

      return "";
    }

    _renderFieldErrors(fieldName, rowErrors) {
      var messages = [];

      for (var i = 0; i < rowErrors.length; i++) {
        var err = rowErrors[i];
        if (err.field === fieldName) {
          messages.push(err.message);
        }
      }

      if (!messages.length) {
        return "";
      }

      return '<div class="rowErr">' + messages.join("<br>") + '</div>';
    }

    _hasFieldError(fieldName, rowErrors) {
      for (var i = 0; i < rowErrors.length; i++) {
        if (rowErrors[i].field === fieldName) {
          return true;
        }
      }
      return false;
    }

    _getRowErrorMap() {
      var map = {};
      for (var i = 0; i < this._validationErrors.length; i++) {
        var err = this._validationErrors[i];
        var rowIndex = Number(err.rowIndex) - 1;
        var errTab = err.tab || "create";

        if (errTab !== this._activeTab) {
          continue;
        }

        if (!map[rowIndex]) {
          map[rowIndex] = [];
        }
        map[rowIndex].push(err);
      }
      return map;
    }

    _createDropdownPanel() {
      if (this._dropdownPanel) {
        return;
      }

      var dropdownPanel = document.createElement("div");
      dropdownPanel.className = "project-widget-dropdown-panel";
      dropdownPanel.style.display = "none";

      dropdownPanel.innerHTML =
        '<div class="dropdown-topbar">' +
          '<div class="dropdown-search-wrap">' +
            '<input type="text" class="dropdown-search-input" placeholder="Search..." />' +
          '</div>' +
          '<button type="button" class="dropdown-close-btn" title="Close">✕</button>' +
        '</div>' +
        '<div class="dropdown-clear-wrap" style="display:none;">' +
          '<button type="button" class="dropdown-clear-btn">Clear selection</button>' +
        '</div>' +
        '<div class="dropdown-list"></div>';

      document.body.appendChild(dropdownPanel);

      this._dropdownPanel = dropdownPanel;
      this._dropdownSearch = dropdownPanel.querySelector(".dropdown-search-input");
      this._dropdownList = dropdownPanel.querySelector(".dropdown-list");
      this._dropdownClearWrap = dropdownPanel.querySelector(".dropdown-clear-wrap");
      this._dropdownClearBtn = dropdownPanel.querySelector(".dropdown-clear-btn");
      this._dropdownCloseBtn = dropdownPanel.querySelector(".dropdown-close-btn");

      var that = this;

      this._dropdownSearch.addEventListener("input", function () {
        if (that._dropdownSearchTimer) {
          clearTimeout(that._dropdownSearchTimer);
        }

        that._dropdownSearchTimer = setTimeout(function () {
          that._applyDropdownSearch(that._dropdownSearch.value);
        }, 120);
      });

      this._dropdownCloseBtn.addEventListener("click", function () {
        that._closeDropdown();
      });

      this._dropdownClearBtn.addEventListener("click", function () {
        var rowIndex = that._activeDropdownRow;
        var fieldName = that._activeDropdownField;
        var tabName = that._activeDropdownTab;
        var rows = that._getRowsByTab(tabName);

        if (!rows[rowIndex]) {
          that._closeDropdown();
          return;
        }

        rows[rowIndex][fieldName] = "";

        if (tabName !== "manage") {
          that._updateRowId(rows[rowIndex]);
        }

        rows[rowIndex].isModified = true;
        rows[rowIndex].rowStatus = "CHANGED";

        that._validationErrors = [];
        that._validationResult = "true";
        that._widgetStatus = "CHANGED";
        that._lastEvent = JSON.stringify({
          type: tabName === "manage" ? "manageFieldChange" : "fieldChange",
          tab: tabName,
          rowIndex: rowIndex,
          field: fieldName,
          value: ""
        });

        that._syncAll();
        that._renderVisibleOnly();
        that._refreshToolbarButtons();
        that._refreshSummaryOnly();
        that._fireSimpleEvent("onFieldChange", { tab: tabName, rowIndex: rowIndex, field: fieldName, value: "" });
        that._fireSimpleEvent("onDataChange", { activeTab: that._activeTab, rows: that._rows, manageRows: that._manageRows });
        that._closeDropdown();
      });

      this._dropdownList.addEventListener("scroll", function () {
        var nearBottom = that._dropdownList.scrollTop + that._dropdownList.clientHeight >= that._dropdownList.scrollHeight - 30;
        if (nearBottom) {
          that._appendNextDropdownBatch();
        }
      });

      this._documentClickHandler = function (e) {
        if (!that._dropdownOpen) {
          return;
        }

        var insidePanel = that._dropdownPanel && that._dropdownPanel.contains(e.target);
        var insideTrigger = that._activeDropdownTrigger && that._activeDropdownTrigger.contains(e.target);

        if (!insidePanel && !insideTrigger) {
          that._closeDropdown();
        }
      };

      document.addEventListener("click", this._documentClickHandler);
    }

    _openDropdown(triggerEl, tabName, rowIndex, fieldName) {
      this._createDropdownPanel();

      this._activeDropdownTrigger = triggerEl;
      this._activeDropdownTab = tabName;
      this._activeDropdownRow = rowIndex;
      this._activeDropdownField = fieldName;
      this._activeDropdownOptions = this._getOptionsForField(tabName, fieldName, rowIndex) || [];

      var rows = this._getRowsByTab(tabName);
      this._activeDropdownSelectedKey = rows[rowIndex] ? rows[rowIndex][fieldName] : "";

      if (this._dropdownClearWrap) {
        if (this._activeDropdownSelectedKey !== "") {
          this._dropdownClearWrap.style.display = "block";
        } else {
          this._dropdownClearWrap.style.display = "none";
        }
      }

      var triggerRect = triggerEl.getBoundingClientRect();
      var dropdownWidth = Math.max(triggerRect.width, 320);
      var dropdownTop = triggerRect.bottom + 4;
      var dropdownLeft = triggerRect.left;

      if (dropdownLeft + dropdownWidth > window.innerWidth - 10) {
        dropdownLeft = window.innerWidth - dropdownWidth - 10;
      }

      if (dropdownLeft < 10) {
        dropdownLeft = 10;
      }

      this._dropdownPanel.style.display = "block";
      this._dropdownPanel.style.position = "fixed";
      this._dropdownPanel.style.left = dropdownLeft + "px";
      this._dropdownPanel.style.top = dropdownTop + "px";
      this._dropdownPanel.style.width = dropdownWidth + "px";
      this._dropdownPanel.style.zIndex = "999999";

      this._dropdownSearch.value = "";
      this._filteredDropdownOptions = this._activeDropdownOptions.slice(0);
      this._dropdownRenderedCount = 0;
      this._dropdownList.innerHTML = "";
      this._appendNextDropdownBatch();
      this._dropdownOpen = true;

      var that = this;
      setTimeout(function () {
        if (that._dropdownSearch) {
          that._dropdownSearch.focus();
        }
      }, 0);
    }

    _closeDropdown() {
      if (this._dropdownPanel) {
        this._dropdownPanel.style.display = "none";
      }

      this._dropdownOpen = false;
      this._activeDropdownTrigger = null;
      this._activeDropdownTab = "create";
      this._activeDropdownRow = -1;
      this._activeDropdownField = "";
      this._activeDropdownOptions = [];
      this._activeDropdownSelectedKey = "";
      this._filteredDropdownOptions = [];
      this._dropdownRenderedCount = 0;
    }

    _applyDropdownSearch(searchText) {
      var source = this._activeDropdownOptions || [];
      var searchValue = String(searchText || "").toLowerCase().trim();
      var filtered = [];
      var i = 0;

      if (searchValue === "") {
        this._filteredDropdownOptions = source.slice(0);
      } else {
        for (i = 0; i < source.length; i++) {
          if (source[i].searchText.indexOf(searchValue) > -1) {
            filtered.push(source[i]);
          }
        }
        this._filteredDropdownOptions = filtered;
      }

      this._dropdownRenderedCount = 0;
      this._dropdownList.innerHTML = "";
      this._appendNextDropdownBatch();
    }

    _appendNextDropdownBatch() {
      if (!this._dropdownList || !this._filteredDropdownOptions) {
        return;
      }

      var start = this._dropdownRenderedCount;
      var end = start + this._dropdownBatchSize;

      if (start >= this._filteredDropdownOptions.length) {
        return;
      }

      var fragment = document.createDocumentFragment();
      var that = this;

      for (var i = start; i < end && i < this._filteredDropdownOptions.length; i++) {
        var opt = this._filteredDropdownOptions[i];
        var item = document.createElement("div");
        item.className = "dropdown-item";

        if (String(opt.key) === String(this._activeDropdownSelectedKey)) {
          item.className += " selected";
        }

        item.textContent = opt.text;
        item.setAttribute("data-key", opt.key);

        item.addEventListener("mousedown", function (e) {
          e.preventDefault();

          var selectedKeyValue = this.getAttribute("data-key");
          var rowIndex = that._activeDropdownRow;
          var fieldName = that._activeDropdownField;
          var tabName = that._activeDropdownTab;
          var rows = that._getRowsByTab(tabName);

          if (!rows[rowIndex]) {
            that._closeDropdown();
            return;
          }

          rows[rowIndex][fieldName] = selectedKeyValue;

          if (tabName !== "manage") {
            that._updateRowId(rows[rowIndex]);
          }

          rows[rowIndex].isModified = true;
          rows[rowIndex].rowStatus = "CHANGED";

          that._validationErrors = [];
          that._validationResult = "true";
          that._widgetStatus = "CHANGED";
          that._lastEvent = JSON.stringify({
            type: tabName === "manage" ? "manageFieldChange" : "fieldChange",
            tab: tabName,
            rowIndex: rowIndex,
            field: fieldName,
            value: selectedKeyValue
          });

          that._syncAll();
          that._renderVisibleOnly();
          that._refreshToolbarButtons();
          that._refreshSummaryOnly();
          that._fireSimpleEvent("onFieldChange", { tab: tabName, rowIndex: rowIndex, field: fieldName, value: selectedKeyValue });
          that._fireSimpleEvent("onDataChange", { activeTab: that._activeTab, rows: that._rows, manageRows: that._manageRows });
          that._closeDropdown();
        });

        fragment.appendChild(item);
      }

      this._dropdownList.appendChild(fragment);
      this._dropdownRenderedCount = Math.min(end, this._filteredDropdownOptions.length);

      if (this._dropdownRenderedCount < this._filteredDropdownOptions.length) {
        if (!this._dropdownListMoreEl) {
          this._dropdownListMoreEl = document.createElement("div");
          this._dropdownListMoreEl.className = "dropdown-more";
        }

        this._dropdownListMoreEl.textContent =
          "Showing " + String(this._dropdownRenderedCount) + " of " + String(this._filteredDropdownOptions.length);

        if (!this._dropdownListMoreEl.parentNode) {
          this._dropdownList.appendChild(this._dropdownListMoreEl);
        } else {
          this._dropdownList.appendChild(this._dropdownListMoreEl);
        }
      } else {
        if (this._dropdownListMoreEl && this._dropdownListMoreEl.parentNode) {
          this._dropdownListMoreEl.parentNode.removeChild(this._dropdownListMoreEl);
        }
      }

      if (this._filteredDropdownOptions.length === 0) {
        this._dropdownList.innerHTML = '<div class="dropdown-empty">No results found</div>';
      }
    }

    _bindEvents() {
      var that = this;

      var tabCreate = this._shadowRoot.getElementById("tabCreate");
      if (tabCreate) {
        tabCreate.addEventListener("click", function () {
          that._changeTabFromUI("create");
        });
      }

      var tabManage = this._shadowRoot.getElementById("tabManage");
      if (tabManage) {
        tabManage.addEventListener("click", function () {
          that._changeTabFromUI("manage");
        });
      }

      if (this._activeTab === "create") {
        var btnAdd = this._shadowRoot.getElementById("btnAdd");
        if (btnAdd) btnAdd.addEventListener("click", function () { that.addRow(); });

        var btnCopy = this._shadowRoot.getElementById("btnCopy");
        if (btnCopy) btnCopy.addEventListener("click", function () { that.copySelectedRows(); });

        var btnDelete = this._shadowRoot.getElementById("btnDelete");
        if (btnDelete) btnDelete.addEventListener("click", function () { that.deleteSelectedRows(); });

        var btnValidate = this._shadowRoot.getElementById("btnValidate");
        if (btnValidate) btnValidate.addEventListener("click", function () { that.validate(); });

        var btnSave = this._shadowRoot.getElementById("btnSave");
        if (btnSave) btnSave.addEventListener("click", function () { that.save(); });

        var btnClear = this._shadowRoot.getElementById("btnClear");
        if (btnClear) btnClear.addEventListener("click", function () { that.clear(); });

        var selectAllCreate = this._shadowRoot.getElementById("selectAllCreate");
        if (selectAllCreate) {
          selectAllCreate.addEventListener("change", function () {
            that._toggleSelectAll("create", selectAllCreate.checked);
          });
        }
      }

      if (this._activeTab === "manage") {
        var manageIdSearch = this._shadowRoot.getElementById("manageIdSearch");
        if (manageIdSearch) {
          manageIdSearch.value = this._manageIdSearch || "";
          manageIdSearch.addEventListener("input", function () {
            that._manageIdSearch = this.value || "";
            that._manageCurrentPage = 1;
            that._rebuildManageFilteredIndexes();
            that._renderVisibleOnly();
          });
        }

        var btnLoadManage = this._shadowRoot.getElementById("btnLoadManage");
        if (btnLoadManage) btnLoadManage.addEventListener("click", function () { that.loadManageData(); });

        var btnSaveManage = this._shadowRoot.getElementById("btnSaveManage");
        if (btnSaveManage) btnSaveManage.addEventListener("click", function () { that.saveManageData(); });

        var btnDeleteManage = this._shadowRoot.getElementById("btnDeleteManage");
        if (btnDeleteManage) btnDeleteManage.addEventListener("click", function () { that.deleteManageData(); });

        var btnClearManage = this._shadowRoot.getElementById("btnClearManage");
        if (btnClearManage) btnClearManage.addEventListener("click", function () { that.clear(); });

        var btnPrevPage = this._shadowRoot.getElementById("btnPrevPage");
        if (btnPrevPage) btnPrevPage.addEventListener("click", function () { that._goToPreviousPage(); });

        var btnNextPage = this._shadowRoot.getElementById("btnNextPage");
        if (btnNextPage) btnNextPage.addEventListener("click", function () { that._goToNextPage(); });

        var selectAllManage = this._shadowRoot.getElementById("selectAllManage");
        if (selectAllManage) {
          selectAllManage.addEventListener("change", function () {
            that._toggleSelectAll("manage", selectAllManage.checked);
          });
        }
      }
    }

    _bindCellEvents() {
      var that = this;
      var allElements = this._shadowRoot.querySelectorAll("[data-row][data-field]");

      Array.prototype.forEach.call(allElements, function (el) {
        var type = el.getAttribute("data-type");
        var tabName = el.getAttribute("data-tab");

        if (type === "checkbox") {
          el.addEventListener("change", function () {
            var rowIndex = parseInt(this.getAttribute("data-row"), 10);
            var fieldName = this.getAttribute("data-field");
            var value = this.checked;
            var rows = that._getRowsByTab(tabName);

            if (!rows[rowIndex]) {
              return;
            }

            rows[rowIndex][fieldName] = value;
            rows[rowIndex].isModified = true;
            rows[rowIndex].rowStatus = "CHANGED";
            that._validationErrors = [];
            that._validationResult = "true";
            that._widgetStatus = "CHANGED";
            that._lastEvent = JSON.stringify({
              type: tabName === "manage" ? "manageFieldChange" : "fieldChange",
              tab: tabName,
              rowIndex: rowIndex,
              field: fieldName,
              value: value
            });

            that._syncAll();
            that._renderVisibleOnly();
            that._refreshToolbarButtons();
            that._refreshSummaryOnly();
            that._fireSimpleEvent("onFieldChange", { tab: tabName, rowIndex: rowIndex, field: fieldName, value: value });
            that._fireSimpleEvent("onDataChange", { activeTab: that._activeTab, rows: that._rows, manageRows: that._manageRows });
          });
          return;
        }

        if (type === "select") {
          el.addEventListener("click", function (e) {
            e.stopPropagation();
            var rowIndex = parseInt(this.getAttribute("data-row"), 10);
            var fieldName = this.getAttribute("data-field");
            that._openDropdown(this, tabName, rowIndex, fieldName);
          });

          el.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              var rowIndex = parseInt(this.getAttribute("data-row"), 10);
              var fieldName = this.getAttribute("data-field");
              that._openDropdown(this, tabName, rowIndex, fieldName);
            }
          });
          return;
        }
      });
    }

    _changeTabFromUI(tabName) {
      if (tabName !== "create" && tabName !== "manage") {
        tabName = "create";
      }

      this._activeTab = tabName;
      this._validationErrors = [];
      this._validationResult = "true";
      this._lastEvent = JSON.stringify({ type: "tabChange", activeTab: tabName });
      this._widgetStatus = "READY";

      if (tabName === "manage") {
        this._rebuildManageFilteredIndexes();
      }

      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, rows: this._rows, manageRows: this._manageRows });
    }

    _fireSimpleEvent(name, detail) {
      this.dispatchEvent(new CustomEvent(name, { detail: detail }));
    }

    _firePropertiesChanged() {
      this.dispatchEvent(new CustomEvent("propertiesChanged", {
        detail: {
          properties: {
            rows: JSON.stringify(this._rows),
            managedata: JSON.stringify(this._manageRows),
            activetab: this._activeTab,
            lastEvent: this._lastEvent,
            validationResult: this._validationResult,
            validationErrors: JSON.stringify(this._validationErrors || []),
            savePayload: JSON.stringify(this._savePayload || []),
            rowCount: this.getRowCount(),
            selectedRowCount: this.getSelectedRowCount(),
            widgetStatus: this._widgetStatus,
            manageGlAccountFilter: JSON.stringify(this._manageGlAccountFilter || []),
            manageCostCenterFilter: JSON.stringify(this._manageCostCenterFilter || []),
            manageProfitCenterFilter: JSON.stringify(this._manageProfitCenterFilter || []),
            manageSegmentFilter: JSON.stringify(this._manageSegmentFilter || [])
          }
        }
      }));
    }

    _syncAll() {
      this._firePropertiesChanged();
    }

    addRow() {
      if (this._activeTab !== "create") {
        return;
      }

      this._rows.push(this._createEmptyRow("NEW"));
      this._widgetStatus = "CHANGED";
      this._lastEvent = JSON.stringify({ type: "addRow", tab: "create" });
      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, rows: this._rows });
    }

    copySelectedRows() {
      if (this._activeTab !== "create") {
        return;
      }

      var copiedRows = [];
      var copiedOptions = [];
      var i = 0;

      for (i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected === true) {
          var newRow = {
            rowId: "ROW_" + String(this._rowSequence++),
            selected: false,
            isModified: true,
            rowStatus: "NEW",
            GLACCOUNT: this._rows[i].GLACCOUNT || "",
            COSTCENTER: this._rows[i].COSTCENTER || "",
            PROFITCENTER: this._rows[i].PROFITCENTER || "",
            SEGMENT: this._rows[i].SEGMENT || "",
            ID: "",
            MANAGEMENT_SUB_MAPPING: this._rows[i].MANAGEMENT_SUB_MAPPING || "",
            MANAGEMENT_MAPPING: this._rows[i].MANAGEMENT_MAPPING || "",
            Hierarchy: this._rows[i].Hierarchy || ""
          };

          copiedRows.push(newRow);

          if (this._rowOptions[i]) {
            copiedOptions.push(this._cloneRowFieldOptions(this._rowOptions[i]));
          } else {
            copiedOptions.push(null);
          }
        }
      }

      if (!copiedRows.length) {
        return;
      }

      for (var j = 0; j < copiedRows.length; j++) {
        this._updateRowId(copiedRows[j]);
        this._rows.push(copiedRows[j]);

        var newIndex = this._rows.length - 1;
        if (copiedOptions[j]) {
          this._rowOptions[newIndex] = copiedOptions[j];
        }
      }

      this._validationErrors = [];
      this._validationResult = "true";
      this._widgetStatus = "CHANGED";
      this._lastEvent = JSON.stringify({ type: "copySelectedRows", tab: "create", copiedCount: copiedRows.length });
      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, rows: this._rows });
    }

    deleteSelectedRows() {
      if (this._activeTab !== "create") {
        return;
      }

      var oldRows = this._rows.slice(0);
      var remainingRows = [];

      for (var i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected !== true) {
          remainingRows.push(this._rows[i]);
        }
      }

      if (!remainingRows.length) {
        remainingRows = [this._createEmptyRow("NEW")];
      }

      this._rows = remainingRows;
      this._normalizeAllRows(this._rows, "NEW");
      this._rebuildRowOptionsAfterRowChange("create", oldRows, this._rows);
      this._validationErrors = [];
      this._validationResult = "true";
      this._widgetStatus = "CHANGED";
      this._lastEvent = JSON.stringify({ type: "deleteSelectedRows", tab: "create" });
      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, rows: this._rows });
    }

    clear() {
      if (this._activeTab === "manage") {
        this._manageRows = [];
        this._manageRowOptions = {};
        this._validationErrors = [];
        this._validationResult = "true";
        this._lastEvent = JSON.stringify({ type: "clearManage", tab: "manage" });
        this._manageIdSearch = "";
        this._filteredManageIndexes = [];
        this._manageCurrentPage = 1;
        this._widgetStatus = "READY";
      } else {
        this._rows = [this._createEmptyRow("NEW")];
        this._rowOptions = {};
        this._validationErrors = [];
        this._validationResult = "true";
        this._savePayload = [];
        this._lastEvent = JSON.stringify({ type: "clear", tab: "create" });
        this._widgetStatus = "READY";
      }

      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, rows: this._rows, manageRows: this._manageRows });
    }

    validate() {
      if (this._activeTab !== "create") {
        return "true";
      }

      var errors = [];
      var idMap = {};

      for (var i = 0; i < this._rows.length; i++) {
        var row = this._rows[i];
        var rowIndex = i + 1;

        if (!row.GLACCOUNT) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "GLACCOUNT", message: "GLACCOUNT is mandatory" });
        }
        if (!row.COSTCENTER) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "COSTCENTER", message: "COSTCENTER is mandatory" });
        }
        if (!row.PROFITCENTER) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "PROFITCENTER", message: "PROFITCENTER is mandatory" });
        }
        if (!row.SEGMENT) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "SEGMENT", message: "SEGMENT is mandatory" });
        }
        if (!row.Hierarchy) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "Hierarchy", message: "Hierarchy is mandatory" });
        }
        if (!row.MANAGEMENT_MAPPING) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "MANAGEMENT_MAPPING", message: "MANAGEMENT MAPPING is mandatory" });
        }
        if (!row.MANAGEMENT_SUB_MAPPING) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "MANAGEMENT_SUB_MAPPING", message: "MANAGEMENT SUB-MAPPING is mandatory" });
        }

        this._updateRowId(row);

        if (!row.ID) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "ID", message: "ID could not be generated" });
        }

        if (row.ID) {
          if (idMap[row.ID]) {
            errors.push({ tab: "create", rowIndex: rowIndex, field: "ID", message: "Duplicate ID found" });
          } else {
            idMap[row.ID] = true;
          }
        }
      }

      this._validationErrors = errors;
      this._validationResult = errors.length === 0 ? "true" : "false";
      this._lastEvent = JSON.stringify({
        type: "validate",
        tab: "create",
        validationResult: this._validationResult,
        errorCount: errors.length
      });
      this._widgetStatus = errors.length === 0 ? "VALID" : "ERROR";

      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onValidate", {
        activeTab: this._activeTab,
        validationResult: this._validationResult,
        validationErrors: errors
      });

      return this._validationResult;
    }

    save() {
      if (this._activeTab !== "create") {
        return;
      }

      var validationResult = this.validate();

      if (validationResult !== "true") {
        this._savePayload = [];
        this._lastEvent = JSON.stringify({
          type: "save",
          tab: "create",
          status: "VALIDATION_FAILED",
          validationResult: this._validationResult,
          errorCount: this._validationErrors.length
        });
        this._widgetStatus = "ERROR";
        this._syncAll();
        this._fireSimpleEvent("onDataChange", {
          activeTab: this._activeTab,
          rows: this._rows,
          savePayload: [],
          validationErrors: this._validationErrors
        });
        return;
      }

      var payload = [];

      for (var i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected === true) {
          payload.push({
            GLACCOUNT: this._rows[i].GLACCOUNT,
            COSTCENTER: this._rows[i].COSTCENTER,
            PROFITCENTER: this._rows[i].PROFITCENTER,
            SEGMENT: this._rows[i].SEGMENT,
            ID: this._rows[i].ID,
            MANAGEMENT_SUB_MAPPING: this._rows[i].MANAGEMENT_SUB_MAPPING,
            MANAGEMENT_MAPPING: this._rows[i].MANAGEMENT_MAPPING,
            Hierarchy: this._rows[i].Hierarchy
          });
        }
      }

      if (payload.length === 0) {
        this._savePayload = [];
        this._validationErrors = [{
          tab: "create",
          rowIndex: 1,
          field: "selected",
          message: "Please select at least one row to save"
        }];
        this._validationResult = "false";
        this._widgetStatus = "ERROR";
        this._lastEvent = JSON.stringify({
          type: "save",
          tab: "create",
          status: "NO_SELECTION",
          payloadCount: 0
        });
        this._syncAll();
        this._refreshTable();
        this._fireSimpleEvent("onDataChange", {
          activeTab: this._activeTab,
          rows: this._rows,
          savePayload: [],
          validationErrors: this._validationErrors
        });
        return;
      }

      this._validationErrors = [];
      this._validationResult = "true";
      this._savePayload = payload;
      this._lastEvent = JSON.stringify({
        type: "save",
        tab: "create",
        status: "READY",
        payloadCount: payload.length
      });
      this._widgetStatus = "SAVE_READY";
      this._syncAll();
      this._fireSimpleEvent("onDataChange", {
        activeTab: this._activeTab,
        rows: this._rows,
        savePayload: payload
      });
    }

    loadManageData() {
      this._lastEvent = JSON.stringify({
        type: "loadManageData",
        tab: "manage"
      });
      this._widgetStatus = "READY";
      this._syncAll();
      this._fireSimpleEvent("onDataChange", {
        activeTab: this._activeTab,
        manageRows: this._manageRows
      });
    }

    saveManageData() {
      if (this._activeTab !== "manage") {
        return;
      }

      var payload = [];
      var visibleIndexes = this._getManagePagedIndexes();

      for (var x = 0; x < visibleIndexes.length; x++) {
        var i = visibleIndexes[x];
        if (this._manageRows[i].selected === true) {
          payload.push({
            GLACCOUNT: this._manageRows[i].GLACCOUNT,
            COSTCENTER: this._manageRows[i].COSTCENTER,
            PROFITCENTER: this._manageRows[i].PROFITCENTER,
            SEGMENT: this._manageRows[i].SEGMENT,
            ID: this._manageRows[i].ID,
            MANAGEMENT_SUB_MAPPING: this._manageRows[i].MANAGEMENT_SUB_MAPPING,
            MANAGEMENT_MAPPING: this._manageRows[i].MANAGEMENT_MAPPING,
            Hierarchy: this._manageRows[i].Hierarchy,
            rowStatus: this._manageRows[i].rowStatus || "CHANGED"
          });
        }
      }

      if (payload.length === 0) {
        this._savePayload = [];
        this._validationErrors = [{
          tab: "manage",
          rowIndex: 1,
          field: "selected",
          message: "Please select at least one row to save"
        }];
        this._validationResult = "false";
        this._widgetStatus = "ERROR";
        this._lastEvent = JSON.stringify({
          type: "saveManageData",
          tab: "manage",
          status: "NO_SELECTION",
          payloadCount: 0
        });
        this._syncAll();
        this._renderVisibleOnly();
        this._fireSimpleEvent("onDataChange", {
          activeTab: this._activeTab,
          manageRows: this._manageRows,
          savePayload: []
        });
        return;
      }

      this._validationErrors = [];
      this._validationResult = "true";
      this._savePayload = payload;
      this._widgetStatus = "SAVE_READY";
      this._lastEvent = JSON.stringify({
        type: "saveManageData",
        tab: "manage",
        status: "READY",
        payloadCount: payload.length
      });
      this._syncAll();
      this._fireSimpleEvent("onDataChange", {
        activeTab: this._activeTab,
        manageRows: this._manageRows,
        savePayload: payload
      });
    }

    deleteManageData() {
      if (this._activeTab !== "manage") {
        return;
      }

      var payload = [];
      var visibleIndexes = this._getManagePagedIndexes();

      for (var x = 0; x < visibleIndexes.length; x++) {
        var i = visibleIndexes[x];
        if (this._manageRows[i].selected === true) {
          payload.push({
            GLACCOUNT: this._manageRows[i].GLACCOUNT,
            COSTCENTER: this._manageRows[i].COSTCENTER,
            PROFITCENTER: this._manageRows[i].PROFITCENTER,
            SEGMENT: this._manageRows[i].SEGMENT,
            ID: this._manageRows[i].ID,
            MANAGEMENT_SUB_MAPPING: this._manageRows[i].MANAGEMENT_SUB_MAPPING,
            MANAGEMENT_MAPPING: this._manageRows[i].MANAGEMENT_MAPPING,
            Hierarchy: this._manageRows[i].Hierarchy,
            rowStatus: "DELETE"
          });
        }
      }

      if (payload.length === 0) {
        this._savePayload = [];
        this._validationErrors = [{
          tab: "manage",
          rowIndex: 1,
          field: "selected",
          message: "Please select at least one row to delete"
        }];
        this._validationResult = "false";
        this._widgetStatus = "ERROR";
        this._lastEvent = JSON.stringify({
          type: "deleteManageData",
          tab: "manage",
          status: "NO_SELECTION",
          payloadCount: 0
        });
        this._syncAll();
        this._renderVisibleOnly();
        this._fireSimpleEvent("onDataChange", {
          activeTab: this._activeTab,
          manageRows: this._manageRows,
          savePayload: []
        });
        return;
      }

      this._validationErrors = [];
      this._validationResult = "true";
      this._savePayload = payload;
      this._widgetStatus = "SAVE_READY";
      this._lastEvent = JSON.stringify({
        type: "deleteManageData",
        tab: "manage",
        status: "READY",
        payloadCount: payload.length
      });
      this._syncAll();
      this._fireSimpleEvent("onDataChange", {
        activeTab: this._activeTab,
        manageRows: this._manageRows,
        savePayload: payload
      });
    }

    getRows() {
      return JSON.stringify(this._rows || []);
    }

    setRows(rowsJson) {
      var oldRows = this._rows.slice(0);

      try {
        this._rows = JSON.parse(rowsJson || "[]");
        if (!Array.isArray(this._rows) || this._rows.length === 0) {
          this._rows = [this._createEmptyRow("NEW")];
        }
      } catch (e) {
        this._rows = [this._createEmptyRow("NEW")];
      }

      this._normalizeAllRows(this._rows, "NEW");
      this._rebuildRowOptionsAfterRowChange("create", oldRows, this._rows);
      this._cleanupRowOptions("create");
      this._widgetStatus = "LOADED";
      this._syncAll();
      this._refreshTable();
    }

    getManageData() {
      return JSON.stringify(this._manageRows || []);
    }

    setManageData(rowsJson) {
      var oldRows = this._manageRows.slice(0);

      try {
        this._manageRows = JSON.parse(rowsJson || "[]");
        if (!Array.isArray(this._manageRows)) {
          this._manageRows = [];
        }
      } catch (e) {
        this._manageRows = [];
      }

      this._normalizeAllRows(this._manageRows, "LOADED");
      this._rebuildRowOptionsAfterRowChange("manage", oldRows, this._manageRows);
      this._cleanupRowOptions("manage");
      this._rebuildManageFilteredIndexes();
      this._widgetStatus = "LOADED";
      this._syncAll();
      this._refreshTable();
    }

    setActiveTab(tabName) {
      var normalizedTab = tabName === "manage" ? "manage" : "create";
      this._activeTab = normalizedTab;
      if (normalizedTab === "manage") {
        this._rebuildManageFilteredIndexes();
      }
      this._syncAll();
      this._refreshTable();
    }

    getRowCount() {
      var rows = this._getActiveRows();
      return rows.length;
    }

    getSelectedRowCount() {
      if (this._activeTab !== "manage") {
        var rows = this._getActiveRows();
        var count = 0;
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].selected === true) { count++; }
        }
        return count;
      }

      var visibleIndexes = this._getManagePagedIndexes();
      var countManage = 0;
      for (var j = 0; j < visibleIndexes.length; j++) {
        if (this._manageRows[visibleIndexes[j]].selected === true) {
          countManage++;
        }
      }
      return countManage;
    }

    getRowValue(rowIndex, fieldName) {
      var rows = this._getActiveRows();
      if (rowIndex < 0 || rowIndex >= rows.length) {
        return "";
      }
      var row = rows[rowIndex];
      if (!row || row[fieldName] === undefined || row[fieldName] === null) {
        return "";
      }
      return String(row[fieldName]);
    }

    getSelectedRowValue(selectedIndex, fieldName) {
      if (this._activeTab !== "manage") {
        var rowsCreate = this._getActiveRows();
        var selectedRowsCreate = [];

        for (var i = 0; i < rowsCreate.length; i++) {
          if (rowsCreate[i].selected === true) {
            selectedRowsCreate.push(rowsCreate[i]);
          }
        }

        if (selectedIndex < 0 || selectedIndex >= selectedRowsCreate.length) {
          return "";
        }

        var rowCreate = selectedRowsCreate[selectedIndex];
        if (!rowCreate || rowCreate[fieldName] === undefined || rowCreate[fieldName] === null) {
          return "";
        }

        return String(rowCreate[fieldName]);
      }

      var visibleIndexes = this._getManagePagedIndexes();
      var selectedRowsManage = [];

      for (var j = 0; j < visibleIndexes.length; j++) {
        if (this._manageRows[visibleIndexes[j]].selected === true) {
          selectedRowsManage.push(this._manageRows[visibleIndexes[j]]);
        }
      }

      if (selectedIndex < 0 || selectedIndex >= selectedRowsManage.length) {
        return "";
      }

      var rowManage = selectedRowsManage[selectedIndex];
      if (!rowManage || rowManage[fieldName] === undefined || rowManage[fieldName] === null) {
        return "";
      }

      return String(rowManage[fieldName]);
    }

    getValidationErrors() {
      return JSON.stringify(this._validationErrors || []);
    }

    getValidationResult() {
      return this._validationResult || "false";
    }

    getLastEvent() {
      return this._lastEvent || "";
    }

    setGLAccountOptions(json) {
      this._glAccountOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setGlAccountOptions(json) {
      this.setGLAccountOptions(json);
    }

    setCostCenterOptions(json) {
      this._costCenterOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setProfitCenterOptions(json) {
      this._profitCenterOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setSegmentOptions(json) {
      this._segmentOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setHierarchyOptions(json) {
      this._hierarchyOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setManagementMappingOptions(json) {
      this._managementMappingOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setManagementSubMappingOptions(json) {
      this._managementSubMappingOptions = this._parseOptions(json);
      this._refreshTable();
    }

    setGlAccountDropdownOptionsOnly(optionsStr) {
      try {
        var optionsArray = JSON.parse(optionsStr || "[]");

        if (!Array.isArray(optionsArray)) {
          optionsArray = [];
        }

        this._glAccountOptions = this._parseOptions(JSON.stringify(optionsArray));
        this._syncAll();
        this._refreshTable();
      } catch (e) {}
    }

    setCostCenterDropdownOptionsOnly(optionsStr) {
      try {
        var optionsArray = JSON.parse(optionsStr || "[]");

        if (!Array.isArray(optionsArray)) {
          optionsArray = [];
        }

        this._costCenterOptions = this._parseOptions(JSON.stringify(optionsArray));
        this._syncAll();
        this._refreshTable();
      } catch (e) {}
    }

    setProfitCenterDropdownOptionsOnly(optionsStr) {
      try {
        var optionsArray = JSON.parse(optionsStr || "[]");

        if (!Array.isArray(optionsArray)) {
          optionsArray = [];
        }

        this._profitCenterOptions = this._parseOptions(JSON.stringify(optionsArray));
        this._syncAll();
        this._refreshTable();
      } catch (e) {}
    }

    setSegmentDropdownOptionsOnly(optionsStr) {
      try {
        var optionsArray = JSON.parse(optionsStr || "[]");

        if (!Array.isArray(optionsArray)) {
          optionsArray = [];
        }

        this._segmentOptions = this._parseOptions(JSON.stringify(optionsArray));
        this._syncAll();
        this._refreshTable();
      } catch (e) {}
    }

    setManageGlAccountFilter(filterStr) {
      try {
        var filterArray = JSON.parse(filterStr || "[]");

        if (!Array.isArray(filterArray)) {
          filterArray = [];
        }

        var cleanedFilter = [];
        var i = 0;

        for (i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);

          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageGlAccountFilter = cleanedFilter;
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageGlAccountFilter = [];
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      }
    }

    setManageCostCenterFilter(filterStr) {
      try {
        var filterArray = JSON.parse(filterStr || "[]");

        if (!Array.isArray(filterArray)) {
          filterArray = [];
        }

        var cleanedFilter = [];
        var i = 0;

        for (i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);

          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageCostCenterFilter = cleanedFilter;
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageCostCenterFilter = [];
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      }
    }

    setManageProfitCenterFilter(filterStr) {
      try {
        var filterArray = JSON.parse(filterStr || "[]");

        if (!Array.isArray(filterArray)) {
          filterArray = [];
        }

        var cleanedFilter = [];
        var i = 0;

        for (i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);

          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageProfitCenterFilter = cleanedFilter;
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageProfitCenterFilter = [];
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      }
    }

    setManageSegmentFilter(filterStr) {
      try {
        var filterArray = JSON.parse(filterStr || "[]");

        if (!Array.isArray(filterArray)) {
          filterArray = [];
        }

        var cleanedFilter = [];
        var i = 0;

        for (i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);

          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageSegmentFilter = cleanedFilter;
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageSegmentFilter = [];
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      }
    }

    setManageIdSearch(value) {
      this._manageIdSearch = this._safeString(value);
      this._manageCurrentPage = 1;
      this._rebuildManageFilteredIndexes();
      this._renderVisibleOnly();
    }

    setRowFieldOptions(rowIndex, fieldName, json) {
      var index = parseInt(rowIndex, 10);
      if (isNaN(index) || index < 0) {
        return;
      }

      var field = this._safeString(fieldName);
      if (!field) {
        return;
      }

      var parsed = this._parseOptions(json);
      this._setRowOptionsForField("create", index, field, parsed);

      if (this._rows[index]) {
        var currentValue = this._safeString(this._rows[index][field]);
        var keepValue = false;

        for (var i = 0; i < parsed.length; i++) {
          if (String(parsed[i].key) === currentValue) {
            keepValue = true;
            break;
          }
        }

        if (currentValue !== "" && keepValue === false) {
          this._rows[index][field] = "";
          if (field !== "ID") {
            this._rows[index].isModified = true;
            this._rows[index].rowStatus = "CHANGED";
            this._updateRowId(this._rows[index]);
          }
        }
      }

      this._syncAll();
      this._refreshTable();
    }

    setManageRowFieldOptions(rowIndex, fieldName, json) {
      var index = parseInt(rowIndex, 10);
      if (isNaN(index) || index < 0) {
        return;
      }

      var field = this._safeString(fieldName);
      if (!field) {
        return;
      }

      var parsed = this._parseOptions(json);
      this._setRowOptionsForField("manage", index, field, parsed);

      if (this._manageRows[index]) {
        var currentValue = this._safeString(this._manageRows[index][field]);
        var keepValue = false;

        for (var i = 0; i < parsed.length; i++) {
          if (String(parsed[i].key) === currentValue) {
            keepValue = true;
            break;
          }
        }

        if (currentValue !== "" && keepValue === false) {
          this._manageRows[index][field] = "";
          if (field !== "ID") {
            this._manageRows[index].isModified = true;
            this._manageRows[index].rowStatus = "CHANGED";
          }
        }
      }

      this._syncAll();
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setVisible(flag) {
      this.style.display = flag ? "block" : "none";
    }
  }

  if (!customElements.get("com-company-managementwidget")) {
    customElements.define("com-company-managementwidget", ProjectEntryWidget);
  }

  (function () {
    if (document.getElementById("project-widget-dropdown-global-style")) {
      return;
    }

    var globalStyleEl = document.createElement("style");
    globalStyleEl.id = "project-widget-dropdown-global-style";
    globalStyleEl.textContent =
      '.project-widget-dropdown-panel {' +
        'background:#ffffff;' +
        'border:1px solid #cfd9e3;' +
        'border-radius:8px;' +
        'box-shadow:0 8px 24px rgba(34,53,72,0.18);' +
        'overflow:hidden;' +
        'min-width:220px;' +
        'max-width:460px;' +
        'max-height:360px;' +
        'z-index:999999;' +
        'font-family:"72", Arial, sans-serif;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-topbar {' +
        'display:flex;' +
        'align-items:center;' +
        'gap:8px;' +
        'padding:8px 8px 0 8px;' +
        'background:#ffffff;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-search-wrap {' +
        'flex:1 1 auto;' +
        'padding:0;' +
        'border-bottom:none;' +
        'background:#ffffff;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-close-btn {' +
        'width:32px;' +
        'height:32px;' +
        'border:1px solid #b9cae0;' +
        'border-radius:6px;' +
        'background:#ffffff;' +
        'color:#5d7288;' +
        'font-size:14px;' +
        'line-height:1;' +
        'cursor:pointer;' +
        'flex:0 0 auto;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-close-btn:hover {' +
        'background:#edf5ff;' +
        'color:#0a6ed1;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-clear-wrap {' +
        'padding:4px 8px 8px 8px;' +
        'background:#ffffff;' +
        'border-bottom:1px solid #e8eef5;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-clear-btn {' +
        'border:none;' +
        'background:transparent;' +
        'color:#0a6ed1;' +
        'font-size:12px;' +
        'font-weight:600;' +
        'padding:0;' +
        'cursor:pointer;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-clear-btn:hover {' +
        'text-decoration:underline;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-search-input {' +
        'width:100%;' +
        'height:32px;' +
        'border:1px solid #b9cae0;' +
        'border-radius:6px;' +
        'padding:0 10px;' +
        'box-sizing:border-box;' +
        'font-size:13px;' +
        'outline:none;' +
        'color:#223548;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-search-input:focus {' +
        'border-color:#0a6ed1;' +
        'box-shadow:0 0 0 2px rgba(10,110,209,0.12);' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-list {' +
        'max-height:300px;' +
        'overflow:auto;' +
        'background:#ffffff;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-item {' +
        'padding:9px 10px;' +
        'font-size:13px;' +
        'color:#223548;' +
        'cursor:pointer;' +
        'border-bottom:1px solid #f3f6f9;' +
        'line-height:1.35;' +
        'word-break:break-word;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-item:hover {' +
        'background:#edf5ff;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-item.selected {' +
        'background:#e8f2ff;' +
        'color:#0a6ed1;' +
        'font-weight:600;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-empty {' +
        'padding:12px;' +
        'color:#7b8a9a;' +
        'text-align:center;' +
        'font-size:13px;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-more {' +
        'padding:8px 10px;' +
        'font-size:12px;' +
        'color:#6b7c8f;' +
        'text-align:center;' +
        'background:#fafcff;' +
        'border-top:1px solid #eef3f8;' +
        'position:sticky;' +
        'bottom:0;' +
      '}';
    document.head.appendChild(globalStyleEl);
  })();
})();

