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
      this._snapshotOptions = [];
      this._managementMappingOptions = [];
      this._managementSubMappingOptions = [];

      this._rowOptions = {};
      this._manageRowOptions = {};

      this._manageGlAccountFilter = [];
      this._manageCostCenterFilter = [];
      this._manageProfitCenterFilter = [];
      this._manageSegmentFilter = [];
      this._manageSnapshotFilter = [];
      this._manageHierarchyFilter = [];

      this._manageGlAccountFilterMap = {};
      this._manageCostCenterFilterMap = {};
      this._manageProfitCenterFilterMap = {};
      this._manageSegmentFilterMap = {};
      this._manageSnapshotFilterMap = {};
      this._manageHierarchyFilterMap = {};

      this._manageIdSearch = "";
      this._manageIdSearchTimer = null;
      this._filteredManageIndexes = [];
      this._managePageSize = 100;
      this._manageCurrentPage = 1;

      this._dropdownPanel = null;
      this._dropdownSearch = null;
      this._dropdownList = null;
      this._dropdownCloseBtn = null;
      this._dropdownClearBtn = null;
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

      this._filterDropdownPanel = null;
      this._filterDropdownSearch = null;
      this._filterDropdownList = null;
      this._filterDropdownCloseBtn = null;
      this._filterDropdownClearBtn = null;
      this._filterDropdownOpen = false;
      this._activeFilterTrigger = null;
      this._activeFilterField = "";
      this._activeFilterOptions = [];
      this._activeFilterSelectedKey = "";
      this._filteredFilterOptions = [];
      this._filterDropdownRenderedCount = 0;
      this._filterDropdownBatchSize = 100;
      this._filterDropdownSearchTimer = null;
      this._filterDropdownListMoreEl = null;

      this._pastePanelOpen = false;
      this._pasteBuffer = "";

      this._createColumns = [
        { key: "selected", label: "Sel", type: "checkbox", width: "70px" },
        { key: "GLACCOUNT", label: "GLACCOUNT", type: "select", width: "180px" },
        { key: "COSTCENTER", label: "COSTCENTER", type: "select", width: "180px" },
        { key: "PROFITCENTER", label: "PROFITCENTER", type: "select", width: "180px" },
        { key: "SEGMENT", label: "SEGMENT", type: "select", width: "140px" },
        { key: "ID", label: "ID", type: "readonly", width: "250px" },
        { key: "MANAGEMENT_SUB_MAPPING", label: "MANAGEMENT SUB-MAPPING", type: "select", width: "250px" },
        { key: "MANAGEMENT_MAPPING", label: "MANAGEMENT MAPPING", type: "select", width: "230px" },
        { key: "Hierarchy", label: "Hierarchy", type: "select", width: "220px" },
        { key: "SNAPSHOT", label: "SNAPSHOT", type: "select", width: "180px" }
      ];

      this._manageColumns = [
        { key: "selected", label: "Sel", type: "checkbox", width: "70px" },
        { key: "ID", label: "ID", type: "readonly", width: "250px" },
        { key: "GLACCOUNT", label: "GLACCOUNT", type: "readonly", width: "180px" },
        { key: "COSTCENTER", label: "COSTCENTER", type: "readonly", width: "180px" },
        { key: "PROFITCENTER", label: "PROFITCENTER", type: "readonly", width: "180px" },
        { key: "SEGMENT", label: "SEGMENT", type: "readonly", width: "140px" },
        { key: "MANAGEMENT_SUB_MAPPING", label: "MANAGEMENT SUB-MAPPING", type: "select", width: "250px" },
        { key: "MANAGEMENT_MAPPING", label: "MANAGEMENT MAPPING", type: "select", width: "230px" },
        { key: "Hierarchy", label: "Hierarchy", type: "select", width: "220px" },
        { key: "SNAPSHOT", label: "SNAPSHOT", type: "select", width: "180px" }
      ];

      this._render();
    }

    connectedCallback() {
      if (!this._rows || this._rows.length === 0) {
        this._rows = [this._createEmptyRow("NEW")];
      }

      this._createDropdownPanel();
      this._createFilterDropdownPanel();
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
      this._closeFilterDropdown();

      if (this._dropdownPanel && this._dropdownPanel.parentNode) {
        this._dropdownPanel.parentNode.removeChild(this._dropdownPanel);
      }

      if (this._filterDropdownPanel && this._filterDropdownPanel.parentNode) {
        this._filterDropdownPanel.parentNode.removeChild(this._filterDropdownPanel);
      }

      if (this._documentClickHandler) {
        document.removeEventListener("click", this._documentClickHandler);
      }

      if (this._filterDocumentClickHandler) {
        document.removeEventListener("click", this._filterDocumentClickHandler);
      }

      if (this._manageIdSearchTimer) {
        clearTimeout(this._manageIdSearchTimer);
        this._manageIdSearchTimer = null;
      }

      this._dropdownPanel = null;
      this._filterDropdownPanel = null;
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
        "snapshotOptions",
        "managementMappingOptions",
        "managementSubMappingOptions",
        "manageGlAccountFilter",
        "manageCostCenterFilter",
        "manageProfitCenterFilter",
        "manageSegmentFilter",
        "manageSnapshotFilter"
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
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "costCenterOptions") {
        this._costCenterOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "profitCenterOptions") {
        this._profitCenterOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "segmentOptions") {
        this._segmentOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "hierarchyOptions") {
        this._hierarchyOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "snapshotOptions") {
        this._snapshotOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "managementMappingOptions") {
        this._managementMappingOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "managementSubMappingOptions") {
        this._managementSubMappingOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
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

      if (name === "manageSnapshotFilter") {
        this.setManageSnapshotFilter(newValue || "[]");
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
        Hierarchy: "",
        SNAPSHOT: ""
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
      row.SNAPSHOT = this._safeString(row.SNAPSHOT);

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
      if (value === undefined || value === null || value === "undefined") {
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

    _cleanupRowOptions(tabName) {
      var rows = this._getRowsByTab(tabName);
      var bucket = this._getRowOptionsBucketByTab(tabName);
      var cleaned = {};
      for (var i = 0; i < rows.length; i++) {
        if (bucket[i]) {
          cleaned[i] = bucket[i];
        }
      }
      this._setRowOptionsBucketByTab(tabName, cleaned);
    }

    _rebuildRowOptionsAfterRowChange(tabName, oldRows, newRows) {
      var oldBucket = this._getRowOptionsBucketByTab(tabName);
      var newBucket = {};
      var rowIdToOptions = {};
      var i = 0;

      for (i = 0; i < oldRows.length; i++) {
        if (oldRows[i] && oldRows[i].rowId && oldBucket[i]) {
          rowIdToOptions[oldRows[i].rowId] = oldBucket[i];
        }
      }

      for (i = 0; i < newRows.length; i++) {
        if (newRows[i] && newRows[i].rowId && rowIdToOptions[newRows[i].rowId]) {
          newBucket[i] = rowIdToOptions[newRows[i].rowId];
        }
      }

      this._setRowOptionsBucketByTab(tabName, newBucket);
    }

    _syncAll() {
      this.setAttribute("lastEvent", this._lastEvent || "");
      this.setAttribute("validationResult", this._validationResult || "false");
      this.setAttribute("validationErrors", JSON.stringify(this._validationErrors || []));
      this.setAttribute("savePayload", JSON.stringify(this._savePayload || []));
      this.setAttribute("rowCount", String(this.getRowCount()));
      this.setAttribute("selectedRowCount", String(this.getSelectedRowCount()));
      this.setAttribute("widgetStatus", this._widgetStatus || "");
      this.setAttribute("rows", JSON.stringify(this._rows || []));
      this.setAttribute("managedata", JSON.stringify(this._manageRows || []));
      this.setAttribute("activetab", this._activeTab || "create");
    }

    _fireSimpleEvent(name, detail) {
      this.dispatchEvent(new CustomEvent(name, {
        detail: detail || {},
        bubbles: true,
        composed: true
      }));
    }

    _getActiveRows() {
      return this._activeTab === "manage" ? this._manageRows : this._rows;
    }

    _hasSelectedRows(tabName) {
      var rows = this._getRowsByTab(tabName);
      if (tabName !== "manage") {
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].selected === true) {
            return true;
          }
        }
        return false;
      }

      var visibleIndexes = this._getManagePagedIndexes();
      for (var j = 0; j < visibleIndexes.length; j++) {
        if (rows[visibleIndexes[j]] && rows[visibleIndexes[j]].selected === true) {
          return true;
        }
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
      if (visibleIndexes.length === 0) {
        return false;
      }

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

    _isValueInFilterMap(filterArray, filterMap, value) {
      if (!filterArray || filterArray.length === 0) {
        return true;
      }
      var cleanValue = this._safeString(value);
      return filterMap[cleanValue] === true;
    }

    _buildFilterMap(filterArray) {
      var map = {};
      for (var i = 0; i < filterArray.length; i++) {
        map[this._safeString(filterArray[i])] = true;
      }
      return map;
    }

    _isManageRowVisible(rowData) {
      if (!rowData) {
        return false;
      }

      if (!this._isValueInFilterMap(this._manageGlAccountFilter, this._manageGlAccountFilterMap, rowData.GLACCOUNT)) {
        return false;
      }

      if (!this._isValueInFilterMap(this._manageCostCenterFilter, this._manageCostCenterFilterMap, rowData.COSTCENTER)) {
        return false;
      }

      if (!this._isValueInFilterMap(this._manageProfitCenterFilter, this._manageProfitCenterFilterMap, rowData.PROFITCENTER)) {
        return false;
      }

      if (!this._isValueInFilterMap(this._manageSegmentFilter, this._manageSegmentFilterMap, rowData.SEGMENT)) {
        return false;
      }

      if (!this._isValueInFilterMap(this._manageSnapshotFilter, this._manageSnapshotFilterMap, rowData.SNAPSHOT)) {
        return false;
      }

      if (!this._isValueInFilterMap(this._manageHierarchyFilter, this._manageHierarchyFilterMap, rowData.Hierarchy)) {
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
      if (this._filteredManageIndexes.length === 0) {
        return 1;
      }
      return Math.ceil(this._filteredManageIndexes.length / this._managePageSize);
    }

    _getManagePagedIndexes() {
      var start = (this._manageCurrentPage - 1) * this._managePageSize;
      var end = start + this._managePageSize;
      return this._filteredManageIndexes.slice(start, end);
    }

    _getManageCurrentPage() {
      if (this._activeTab !== "manage") {
        return 1;
      }
      return this._manageCurrentPage;
    }

    _goToPreviousPage() {
      if (this._activeTab !== "manage") {
        return;
      }
      if (this._manageCurrentPage > 1) {
        this._manageCurrentPage--;
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
      }
    }

    _goToNextPage() {
      if (this._activeTab !== "manage") {
        return;
      }
      if (this._manageCurrentPage < this._getManageTotalPages()) {
        this._manageCurrentPage++;
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
      }
    }

    _openPastePanel() {
      if (this._activeTab !== "create") {
        return;
      }

      this._pastePanelOpen = true;
      this._pasteBuffer = "";
      this._refreshTable();

      var that = this;
      setTimeout(function () {
        var area = that._shadowRoot.getElementById("pastePanelInput");
        if (area) {
          area.focus();
        }
      }, 0);
    }

    _closePastePanel() {
      this._pastePanelOpen = false;
      this._pasteBuffer = "";
      this._refreshTable();
    }

    _importPastePanelRows() {
      if (this._activeTab !== "create") {
        return;
      }

      var area = this._shadowRoot.getElementById("pastePanelInput");
      var text = area ? area.value : this._pasteBuffer;

      if (!text || String(text).trim() === "") {
        return;
      }

      this._pasteRowsFromClipboard(text);
      this._pastePanelOpen = false;
      this._pasteBuffer = "";
      this._refreshTable();
    }

    _pasteRowsFromClipboard(text) {
      if (this._activeTab !== "create") {
        return;
      }

      var rawText = String(text || "");
      if (!rawText) {
        return;
      }

      rawText = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      var lines = rawText.split("\n");
      var addedCount = 0;
      var i = 0;

      for (i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === undefined || line === null) {
          continue;
        }

        line = String(line).trim();
        if (line === "") {
          continue;
        }

        var cols = line.split("\t");
        if (!cols || cols.length === 0) {
          continue;
        }

        var row = this._createEmptyRow("NEW");

        row.GLACCOUNT = this._safeString(cols[0]);
        row.COSTCENTER = this._safeString(cols[1]);
        row.PROFITCENTER = this._safeString(cols[2]);
        row.SEGMENT = this._safeString(cols[3]);
        row.MANAGEMENT_SUB_MAPPING = this._safeString(cols[4]);
        row.MANAGEMENT_MAPPING = this._safeString(cols[5]);
        row.Hierarchy = this._safeString(cols[6]);
        row.SNAPSHOT = this._safeString(cols[7]);
        row.selected = false;
        row.isModified = true;
        row.rowStatus = "NEW";

        if (
          row.GLACCOUNT === "" &&
          row.COSTCENTER === "" &&
          row.PROFITCENTER === "" &&
          row.SEGMENT === "" &&
          row.MANAGEMENT_SUB_MAPPING === "" &&
          row.MANAGEMENT_MAPPING === "" &&
          row.Hierarchy === "" &&
          row.SNAPSHOT === ""
        ) {
          continue;
        }

        this._updateRowId(row);
        this._rows.push(row);
        addedCount++;
      }

      if (addedCount > 0) {
        if (
          this._rows.length > 1 &&
          this._rows[0] &&
          this._rows[0].GLACCOUNT === "" &&
          this._rows[0].COSTCENTER === "" &&
          this._rows[0].PROFITCENTER === "" &&
          this._rows[0].SEGMENT === "" &&
          this._rows[0].MANAGEMENT_SUB_MAPPING === "" &&
          this._rows[0].MANAGEMENT_MAPPING === "" &&
          this._rows[0].Hierarchy === "" &&
          this._rows[0].SNAPSHOT === ""
        ) {
          this._rows.splice(0, 1);
        }

        this._validationErrors = [];
        this._validationResult = "true";
        this._widgetStatus = "CHANGED";
        this._lastEvent = JSON.stringify({
          type: "pasteRows",
          tab: "create",
          addedCount: addedCount
        });
        this._syncAll();
        this._refreshTable();
        this._fireSimpleEvent("onDataChange", {
          activeTab: this._activeTab,
          rows: this._rows
        });
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
      if (!tbody) {
        return;
      }

      var rowErrorMap = this._getRowErrorMap();
      var html = "";
      var i = 0;
      var j = 0;
      var activeColumns = this._activeTab === "manage" ? this._manageColumns : this._createColumns;
      var visibleIndexes = this._activeTab === "manage"
        ? this._getManagePagedIndexes()
        : (function (length) {
            var arr = [];
            for (var k = 0; k < length; k++) {
              arr.push(k);
            }
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
            + "</td>";
        }

        html += "</tr>";
      }

      tbody.innerHTML = html;
      this._bindCellEvents();

      var selectAll = this._shadowRoot.getElementById(this._activeTab === "manage" ? "selectAllManage" : "selectAllCreate");
      if (selectAll) {
        selectAll.checked = this._areAllRowsSelected(this._activeTab);
      }

      this._refreshSummaryOnly();
    }

    _refreshToolbarButtons() {
      var hasSelection = this._hasSelectedRows(this._activeTab);
      var toolbarRight = this._shadowRoot.getElementById("toolbarRight");
      if (!toolbarRight) {
        return;
      }

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

    _updateRowId(row) {
      var parts = [];
      if (row.GLACCOUNT) parts.push(row.GLACCOUNT);
      if (row.COSTCENTER) parts.push(row.COSTCENTER);
      if (row.PROFITCENTER) parts.push(row.PROFITCENTER);
      if (row.SEGMENT) parts.push(row.SEGMENT);

      row.ID = parts.join("-");
    }

    _buildUniqueManageFilterOptions(fieldName) {
      var sourceMap = {};
      var arr = [];
      var i = 0;
      var value = "";

      for (i = 0; i < this._manageRows.length; i++) {
        value = this._safeString(this._manageRows[i][fieldName]);
        if (value !== "" && sourceMap[value] !== true) {
          sourceMap[value] = true;
          arr.push({
            key: value,
            text: value,
            searchText: (value + " " + value).toLowerCase()
          });
        }
      }

      arr.sort(function (a, b) {
        if (a.text < b.text) return -1;
        if (a.text > b.text) return 1;
        return 0;
      });

      return arr;
    }

    _getManageFilterOptions(fieldName) {
      return this._buildUniqueManageFilterOptions(fieldName);
    }

    _getManageFilterCurrentValue(fieldName) {
      if (fieldName === "SEGMENT") {
        if (this._manageSegmentFilter.length > 0) return this._manageSegmentFilter[0];
      }
      if (fieldName === "Hierarchy") {
        if (this._manageHierarchyFilter.length > 0) return this._manageHierarchyFilter[0];
      }
      if (fieldName === "SNAPSHOT") {
        if (this._manageSnapshotFilter.length > 0) return this._manageSnapshotFilter[0];
      }
      return "";
    }

    _setManageInlineFilter(fieldName, value) {
      var cleanValue = this._safeString(value);

      if (fieldName === "SEGMENT") {
        this._manageSegmentFilter = cleanValue === "" ? [] : [cleanValue];
        this._manageSegmentFilterMap = this._buildFilterMap(this._manageSegmentFilter);
      }

      if (fieldName === "Hierarchy") {
        this._manageHierarchyFilter = cleanValue === "" ? [] : [cleanValue];
        this._manageHierarchyFilterMap = this._buildFilterMap(this._manageHierarchyFilter);
      }

      if (fieldName === "SNAPSHOT") {
        this._manageSnapshotFilter = cleanValue === "" ? [] : [cleanValue];
        this._manageSnapshotFilterMap = this._buildFilterMap(this._manageSnapshotFilter);
      }

      this._manageCurrentPage = 1;
      this._rebuildManageFilteredIndexes();
      this._syncAll();
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    _render() {
      this._shadowRoot.innerHTML = `
        <style>
          :host { display:block; font-family:"72", Arial, sans-serif; color:#223548; }
          .wrap { border:1px solid #d9e2ef; border-radius:12px; background:#ffffff; overflow:hidden; }
          .tabbar { display:flex; gap:0; border-bottom:1px solid #dfe8f2; background:#f8fbff; }
          .tabbtn { border:none; background:transparent; padding:14px 18px; cursor:pointer; font-weight:700; font-size:13px; color:#5d7288; border-bottom:3px solid transparent; }
          .tabbtn.active { color:#0a6ed1; border-bottom-color:#0a6ed1; background:#ffffff; }
          .toolbarWrap { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px 16px; border-bottom:1px solid #eef3f8; flex-wrap:wrap; }
          .toolbarLeft, .toolbarRight { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
          .btn { border:1px solid #c8d4e3; background:#ffffff; color:#223548; padding:9px 14px; border-radius:10px; cursor:pointer; font-size:12px; font-weight:700; }
          .btn:hover { background:#f6f9fc; }
          .btn.primary { background:#0a6ed1; border-color:#0a6ed1; color:#ffffff; }
          .btn.primary:hover { background:#085caf; }
          .btn.danger { border-color:#d64550; color:#d64550; }
          .btn.danger:hover { background:#fff5f5; }
          .searchBox { border:1px solid #cdd9e5; border-radius:10px; padding:9px 12px; min-width:240px; font-size:12px; }
          .muted { font-size:12px; color:#5d7288; }
          .manageTopbar { padding:14px 16px 0 16px; }
          .manageFilters { display:flex; gap:12px; flex-wrap:wrap; }
          .filterCard { min-width:220px; }
          .filterCardLabel { font-size:11px; font-weight:700; color:#5d7288; margin-bottom:6px; }
          .gridWrap { overflow:auto; border-top:1px solid #eef3f8; }
          table { width:100%; border-collapse:separate; border-spacing:0; min-width:1700px; }
          thead th { position:sticky; top:0; z-index:2; background:#f7faff; color:#31485f; font-size:12px; text-align:left; padding:10px 10px; border-bottom:1px solid #dfe8f2; border-right:1px solid #edf2f7; white-space:nowrap; }
          tbody td { padding:8px 10px; border-bottom:1px solid #edf2f7; border-right:1px solid #f3f6fa; vertical-align:top; background:#ffffff; }
          tbody tr:hover td { background:#fbfdff; }
          .readonly-cell { min-height:18px; padding:9px 10px; background:#f8fafc; border:1px solid #e4ebf3; border-radius:8px; font-size:12px; color:#31485f; }
          .dropdown-trigger { display:flex; align-items:center; justify-content:space-between; gap:10px; min-height:18px; padding:9px 10px; background:#ffffff; border:1px solid #cfd9e4; border-radius:8px; cursor:pointer; font-size:12px; color:#223548; }
          .dropdown-trigger:hover { border-color:#0a6ed1; }
          .dropdown-trigger .label { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
          .dropdown-trigger .arrow { color:#6f8297; font-size:11px; flex:0 0 auto; }
          .row-checkbox { width:16px; height:16px; cursor:pointer; }
          .summary { display:flex; gap:22px; flex-wrap:wrap; padding:12px 16px; border-top:1px solid #eef3f8; background:#fbfdff; font-size:12px; color:#41586f; }
          .error { border-color:#d64550 !important; background:#fff8f8 !important; }
          .rowErr { font-size:11px; color:#c92a36; margin-top:5px; line-height:1.3; }
          .errorRow td { background:#fffafb; }
          .modifiedRow td { background:#fcfffb; }
          .empty-msg { text-align:center; color:#6b8094; padding:30px 12px !important; }
          .pager { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:12px 16px; border-top:1px solid #eef3f8; background:#ffffff; }
          .pagerControls { display:flex; align-items:center; gap:8px; }
          .pageInfo, .loadMoreInfo { font-size:12px; color:#5d7288; }

          .pasteBanner {
            margin: 12px 16px 0 16px;
            padding: 12px 14px;
            border: 1px solid #d9e7f7;
            background: #f7fbff;
            border-radius: 10px;
          }

          .pasteHint {
            font-size: 12px;
            line-height: 1.5;
            color: #35506b;
          }

          .pasteModalOverlay {
            position: fixed;
            inset: 0;
            background: rgba(34, 53, 72, 0.35);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            box-sizing: border-box;
          }

          .pasteModal {
            width: min(860px, 96vw);
            background: #ffffff;
            border-radius: 14px;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
            border: 1px solid #d9e2ef;
            overflow: hidden;
          }

          .pasteModalHeader {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            border-bottom: 1px solid #e5edf5;
            background: #f8fbff;
          }

          .pasteModalTitle {
            font-size: 16px;
            font-weight: 700;
            color: #223548;
          }

          .pasteModalClose {
            border: none;
            background: transparent;
            font-size: 22px;
            line-height: 1;
            cursor: pointer;
            color: #5d7288;
          }

          .pasteModalBody {
            padding: 16px 18px 12px 18px;
          }

          .pastePanelHelp {
            font-size: 13px;
            color: #223548;
            margin-bottom: 8px;
          }

          .pastePanelOrder {
            font-size: 12px;
            color: #5d7288;
            margin-bottom: 12px;
            line-height: 1.5;
          }

          .pastePanelTextarea {
            width: 100%;
            min-height: 260px;
            resize: vertical;
            border: 1px solid #c9d7e6;
            border-radius: 10px;
            padding: 12px;
            font-family: Consolas, "Courier New", monospace;
            font-size: 12px;
            line-height: 1.45;
            color: #223548;
            background: #ffffff;
            box-sizing: border-box;
            outline: none;
          }

          .pastePanelTextarea:focus {
            border-color: #0a6ed1;
            box-shadow: 0 0 0 3px rgba(10, 110, 209, 0.12);
          }

          .pasteModalFooter {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 14px 18px 18px 18px;
          }

          .project-widget-dropdown-panel {
            position: fixed;
            background: #ffffff;
            border: 1px solid #d5e0ec;
            border-radius: 12px;
            box-shadow: 0 18px 40px rgba(26, 44, 61, 0.18);
            overflow: hidden;
          }

          .dropdown-topbar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px;
            border-bottom: 1px solid #eef3f8;
            background: #fbfdff;
          }

          .dropdown-search-wrap {
            flex: 1;
          }

          .dropdown-search-input {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #cfd9e4;
            border-radius: 8px;
            padding: 8px 10px;
            font-size: 12px;
          }

          .dropdown-close-btn, .dropdown-clear-btn {
            border: 1px solid #c8d4e3;
            background: #ffffff;
            cursor: pointer;
            border-radius: 8px;
            font-size: 12px;
            padding: 7px 10px;
          }

          .dropdown-actions {
            padding: 8px 10px;
            border-bottom: 1px solid #eef3f8;
            background: #ffffff;
          }

          .dropdown-list {
            max-height: 320px;
            overflow: auto;
          }

          .dropdown-item {
            padding: 10px 12px;
            cursor: pointer;
            font-size: 12px;
            border-bottom: 1px solid #f3f6fa;
          }

          .dropdown-item:hover,
          .dropdown-item.selected {
            background: #f2f8ff;
          }

          .dropdown-empty,
          .dropdown-more {
            padding: 10px 12px;
            font-size: 12px;
            color: #5d7288;
          }
        </style>
        <div class="wrap" id="widgetWrap"></div>
      `;
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

      var html = "";
      html += '<div class="tabbar">';
      html += '<button class="tabbtn ' + (this._activeTab === "create" ? "active" : "") + '" id="tabCreate">Create Mapping</button>';
      html += '<button class="tabbtn ' + (this._activeTab === "manage" ? "active" : "") + '" id="tabManage">Manage Mapping</button>';
      html += "</div>";

      html += '<div class="toolbarWrap">';
      if (this._activeTab === "create") {
        html += '<div class="toolbarLeft"></div>';
        html += '<div class="toolbarRight" id="toolbarRight">';
        html += '<button class="btn" id="btnAdd">Add Row</button>';

        if (hasSelection) {
          html += '<button class="btn" id="btnCopy">Copy</button>';
          html += '<button class="btn danger" id="btnDelete">Delete Selected</button>';
        }

        html += '<button class="btn" id="btnPasteExcel">Paste from Excel</button>';
        html += '<button class="btn" id="btnValidate">Validate</button>';
        html += '<button class="btn primary" id="btnSave">Save</button>';
        html += '<button class="btn" id="btnClear">Clear</button>';
        html += "</div>";
      } else {
        html += '<div class="toolbarLeft">';
        html += '<input class="searchBox" id="manageIdSearch" type="text" placeholder="Search ID..." value="' + this._escape(this._manageIdSearch || "") + '" />';
        html += '<span class="muted" id="visibleCountText">Visible: ' + this.getVisibleRowCount() + "</span>";
        html += "</div>";

        html += '<div class="toolbarRight" id="toolbarRight">';
        html += '<button class="btn" id="btnLoadManage">Load Data</button>';
        html += '<button class="btn primary" id="btnSaveManage">Save Changes</button>';

        if (hasSelection) {
          html += '<button class="btn danger" id="btnDeleteManage">Delete Selected</button>';
        }

        html += '<button class="btn" id="btnClearManage">Clear</button>';
        html += "</div>";
      }
      html += "</div>";

      if (this._activeTab === "create") {
        html += '<div class="pasteBanner">';
        html += '<div class="pasteHint"><strong>Excel Paste:</strong> Copy rows in this order: GLACCOUNT, COSTCENTER, PROFITCENTER, SEGMENT, MANAGEMENT_SUB_MAPPING, MANAGEMENT_MAPPING, Hierarchy, SNAPSHOT. Then click <strong>Paste from Excel</strong>.</div>';
        html += "</div>";

        if (this._pastePanelOpen) {
          html += '<div class="pasteModalOverlay" id="pasteModalOverlay">';
          html += '  <div class="pasteModal" role="dialog" aria-modal="true" aria-labelledby="pastePanelTitle">';
          html += '    <div class="pasteModalHeader">';
          html += '      <div class="pasteModalTitle" id="pastePanelTitle">Paste Rows from Excel</div>';
          html += '      <button type="button" class="pasteModalClose" id="btnClosePastePanel">×</button>';
          html += "    </div>";
          html += '    <div class="pasteModalBody">';
          html += '      <div class="pastePanelHelp">Press <strong>Ctrl+V</strong> inside the box below, then click <strong>Import Pasted Rows</strong>.</div>';
          html += '      <div class="pastePanelOrder">Expected column order: GLACCOUNT, COSTCENTER, PROFITCENTER, SEGMENT, MANAGEMENT_SUB_MAPPING, MANAGEMENT_MAPPING, Hierarchy, SNAPSHOT</div>';
          html += '      <textarea id="pastePanelInput" class="pastePanelTextarea" placeholder="Paste Excel rows here...">' + this._escape(this._pasteBuffer || "") + "</textarea>";
          html += "    </div>";
          html += '    <div class="pasteModalFooter">';
          html += '      <button type="button" class="btn" id="btnCancelPastePanel">Cancel</button>';
          html += '      <button type="button" class="btn primary" id="btnImportPastePanel">Import Pasted Rows</button>';
          html += "    </div>";
          html += "  </div>";
          html += "</div>";
        }
      }

      if (this._activeTab === "manage") {
        html += '<div class="manageTopbar">';
        html += '<div class="manageFilters">';
        html += '<div class="filterCard">';
        html += '<div class="filterCardLabel">SEGMENT</div>';
        html += '<div class="filterTrigger dropdown-trigger" tabindex="0" id="filterTriggerSegment" data-filter-field="SEGMENT">';
        html += '<span class="label">' + this._escape(this._getManageFilterCurrentValue("SEGMENT") || "All") + "</span>";
        html += '<span class="arrow">▼</span>';
        html += "</div>";
        html += "</div>";

        html += '<div class="filterCard">';
        html += '<div class="filterCardLabel">Hierarchy</div>';
        html += '<div class="filterTrigger dropdown-trigger" tabindex="0" id="filterTriggerHierarchy" data-filter-field="Hierarchy">';
        html += '<span class="label">' + this._escape(this._getManageFilterCurrentValue("Hierarchy") || "All") + "</span>";
        html += '<span class="arrow">▼</span>';
        html += "</div>";
        html += "</div>";

        html += '<div class="filterCard">';
        html += '<div class="filterCardLabel">SNAPSHOT</div>';
        html += '<div class="filterTrigger dropdown-trigger" tabindex="0" id="filterTriggerSnapshot" data-filter-field="SNAPSHOT">';
        html += '<span class="label">' + this._escape(this._getManageFilterCurrentValue("SNAPSHOT") || "All") + "</span>";
        html += '<span class="arrow">▼</span>';
        html += "</div>";
        html += "</div>";
        html += "</div>";
        html += "</div>";
      }

      html += '<div class="gridWrap" id="gridWrap">';
      html += "<table>";
      html += "<thead><tr>";
      html += '<th style="width:70px"><input type="checkbox" id="' + selectAllId + '" ' + (allSelected ? "checked" : "") + " /></th>";
      for (var i = 1; i < activeColumns.length; i++) {
        html += '<th style="width:' + activeColumns[i].width + '">' + this._escape(activeColumns[i].label) + "</th>";
      }
      html += "</tr></thead>";
      html += '<tbody id="tbodyVirtual"></tbody>';
      html += "</table>";
      html += "</div>";

      if (this._activeTab === "manage") {
        html += '<div class="pager">';
        html += '<div class="pagerControls">';
        html += '<button class="btn" id="btnPrevPage">Previous</button>';
        html += '<button class="btn" id="btnNextPage">Next</button>';
        html += '<span class="pageInfo" id="pageInfo">Page ' + this._getManageCurrentPage() + " of " + this._getManageTotalPages() + "</span>";
        html += "</div>";
        html += '<div class="loadMoreInfo" id="loadMoreInfo"></div>';
        html += "</div>";
      }

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
      var shouldShowError = tabName === "create" || (tabName === "manage" && column.key === "ID");
      var hasError = shouldShowError && this._hasFieldError(column.key, rowErrors);
      var errorCss = hasError ? "error" : "";

      if (column.type === "checkbox") {
        return '<input class="row-checkbox ' + errorCss + '" data-tab="' + tabName + '" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="checkbox" type="checkbox" ' + (value === true ? "checked" : "") + " />";
      }

      if (column.type === "readonly") {
        return '<div class="readonly-cell" data-tab="' + tabName + '" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="readonly">' + this._escape(String(value)) + "</div>" + (shouldShowError ? this._renderFieldErrors(column.key, rowErrors) : "");
      }

      if (column.type === "select") {
        var displayText = this._getOptionText(tabName, column.key, value, rowIndex);
        if (!displayText) {
          displayText = "Select";
        }

        return ""
          + '<div class="dropdown-trigger ' + errorCss + '" tabindex="0" data-tab="' + tabName + '" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="select">'
          + '<span class="label">' + this._escape(String(displayText)) + "</span>"
          + '<span class="arrow">▼</span>'
          + "</div>"
          + (shouldShowError ? this._renderFieldErrors(column.key, rowErrors) : "");
      }

      return "";
    }

    _getGlobalOptionsForField(fieldName) {
      if (fieldName === "GLACCOUNT") return this._glAccountOptions || [];
      if (fieldName === "COSTCENTER") return this._costCenterOptions || [];
      if (fieldName === "PROFITCENTER") return this._profitCenterOptions || [];
      if (fieldName === "SEGMENT") return this._segmentOptions || [];
      if (fieldName === "Hierarchy") return this._hierarchyOptions || [];
      if (fieldName === "SNAPSHOT") return this._snapshotOptions || [];
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

      return valueStr;
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

      return '<div class="rowErr">' + messages.join("<br>") + "</div>";
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
          "</div>" +
          '<button type="button" class="dropdown-close-btn" title="Close">×</button>' +
        "</div>" +
        '<div class="dropdown-actions">' +
          '<button type="button" class="dropdown-clear-btn">Clear selection</button>' +
        "</div>" +
        '<div class="dropdown-list"></div>';

      document.body.appendChild(dropdownPanel);

      this._dropdownPanel = dropdownPanel;
      this._dropdownSearch = dropdownPanel.querySelector(".dropdown-search-input");
      this._dropdownList = dropdownPanel.querySelector(".dropdown-list");
      this._dropdownCloseBtn = dropdownPanel.querySelector(".dropdown-close-btn");
      this._dropdownClearBtn = dropdownPanel.querySelector(".dropdown-clear-btn");

      var that = this;

      if (this._dropdownCloseBtn) {
        this._dropdownCloseBtn.addEventListener("click", function () {
          that._closeDropdown();
        });
      }

      if (this._dropdownClearBtn) {
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
          that._syncAll();
          that._renderVisibleOnly();
          that._refreshToolbarButtons();
          that._refreshSummaryOnly();
          that._fireSimpleEvent("onFieldChange", { tab: tabName, rowIndex: rowIndex, field: fieldName, value: "" });
          that._fireSimpleEvent("onDataChange", { activeTab: that._activeTab, rows: that._rows, manageRows: that._manageRows });
          that._closeDropdown();
        });
      }

      if (this._dropdownSearch) {
        this._dropdownSearch.addEventListener("input", function () {
          var value = this.value || "";
          if (that._dropdownSearchTimer) {
            clearTimeout(that._dropdownSearchTimer);
          }
          that._dropdownSearchTimer = setTimeout(function () {
            that._applyDropdownSearch(value);
          }, 80);
        });
      }

      this._documentClickHandler = function (e) {
        if (!that._dropdownOpen) {
          return;
        }
        if (that._dropdownPanel && that._dropdownPanel.contains(e.target)) {
          return;
        }
        if (that._activeDropdownTrigger && that._activeDropdownTrigger.contains && that._activeDropdownTrigger.contains(e.target)) {
          return;
        }
        that._closeDropdown();
      };

      document.addEventListener("click", this._documentClickHandler);
    }

    _openDropdown(triggerEl, tabName, rowIndex, fieldName) {
      if (!this._dropdownPanel || !triggerEl) {
        return;
      }

      this._activeDropdownTrigger = triggerEl;
      this._activeDropdownTab = tabName;
      this._activeDropdownRow = rowIndex;
      this._activeDropdownField = fieldName;

      var rows = this._getRowsByTab(tabName);
      var row = rows[rowIndex];
      this._activeDropdownSelectedKey = row ? this._safeString(row[fieldName]) : "";
      this._activeDropdownOptions = this._getOptionsForField(tabName, fieldName, rowIndex).slice(0);

      var rect = triggerEl.getBoundingClientRect();
      var dropdownWidth = Math.max(280, rect.width);
      var dropdownHeight = Math.min(window.innerHeight - rect.bottom - 20, 420);

      this._dropdownPanel.style.display = "block";
      this._dropdownPanel.style.left = Math.max(8, rect.left) + "px";
      this._dropdownPanel.style.top = Math.max(8, rect.bottom + 6) + "px";
      this._dropdownPanel.style.width = dropdownWidth + "px";
      this._dropdownPanel.style.maxHeight = dropdownHeight + "px";
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

      if (this._dropdownSearch) {
        this._dropdownSearch.value = "";
      }

      if (this._dropdownList) {
        this._dropdownList.innerHTML = "";
      }

      this._dropdownOpen = false;
      this._activeDropdownTrigger = null;
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

    _createFilterDropdownPanel() {
      if (this._filterDropdownPanel) {
        return;
      }

      var dropdownPanel = document.createElement("div");
      dropdownPanel.className = "project-widget-dropdown-panel";
      dropdownPanel.style.display = "none";

      dropdownPanel.innerHTML =
        '<div class="dropdown-topbar">' +
          '<div class="dropdown-search-wrap">' +
            '<input type="text" class="dropdown-search-input" placeholder="Search..." />' +
          "</div>" +
          '<button type="button" class="dropdown-close-btn" title="Close">×</button>' +
        "</div>" +
        '<div class="dropdown-actions">' +
          '<button type="button" class="dropdown-clear-btn">Clear filter</button>' +
        "</div>" +
        '<div class="dropdown-list"></div>';

      document.body.appendChild(dropdownPanel);

      this._filterDropdownPanel = dropdownPanel;
      this._filterDropdownSearch = dropdownPanel.querySelector(".dropdown-search-input");
      this._filterDropdownList = dropdownPanel.querySelector(".dropdown-list");
      this._filterDropdownCloseBtn = dropdownPanel.querySelector(".dropdown-close-btn");
      this._filterDropdownClearBtn = dropdownPanel.querySelector(".dropdown-clear-btn");

      var that = this;

      if (this._filterDropdownCloseBtn) {
        this._filterDropdownCloseBtn.addEventListener("click", function () {
          that._closeFilterDropdown();
        });
      }

      if (this._filterDropdownClearBtn) {
        this._filterDropdownClearBtn.addEventListener("click", function () {
          that._setManageInlineFilter(that._activeFilterField, "");
          that._closeFilterDropdown();
        });
      }

      if (this._filterDropdownSearch) {
        this._filterDropdownSearch.addEventListener("input", function () {
          var value = this.value || "";
          if (that._filterDropdownSearchTimer) {
            clearTimeout(that._filterDropdownSearchTimer);
          }
          that._filterDropdownSearchTimer = setTimeout(function () {
            that._applyFilterDropdownSearch(value);
          }, 80);
        });
      }

      this._filterDocumentClickHandler = function (e) {
        if (!that._filterDropdownOpen) {
          return;
        }
        if (that._filterDropdownPanel && that._filterDropdownPanel.contains(e.target)) {
          return;
        }
        if (that._activeFilterTrigger && that._activeFilterTrigger.contains && that._activeFilterTrigger.contains(e.target)) {
          return;
        }
        that._closeFilterDropdown();
      };

      document.addEventListener("click", this._filterDocumentClickHandler);
    }

    _openFilterDropdown(triggerEl, fieldName) {
      if (!this._filterDropdownPanel || !triggerEl) {
        return;
      }

      this._activeFilterTrigger = triggerEl;
      this._activeFilterField = fieldName;
      this._activeFilterSelectedKey = this._getManageFilterCurrentValue(fieldName);
      this._activeFilterOptions = this._getManageFilterOptions(fieldName);

      var rect = triggerEl.getBoundingClientRect();
      var dropdownWidth = Math.max(280, rect.width);
      var dropdownHeight = Math.min(window.innerHeight - rect.bottom - 20, 420);

      this._filterDropdownPanel.style.display = "block";
      this._filterDropdownPanel.style.left = Math.max(8, rect.left) + "px";
      this._filterDropdownPanel.style.top = Math.max(8, rect.bottom + 6) + "px";
      this._filterDropdownPanel.style.width = dropdownWidth + "px";
      this._filterDropdownPanel.style.maxHeight = dropdownHeight + "px";
      this._filterDropdownPanel.style.zIndex = "999999";

      this._filterDropdownSearch.value = "";
      this._filteredFilterOptions = this._activeFilterOptions.slice(0);
      this._filterDropdownRenderedCount = 0;
      this._filterDropdownList.innerHTML = "";
      this._appendNextFilterDropdownBatch();
      this._filterDropdownOpen = true;

      var that = this;
      setTimeout(function () {
        if (that._filterDropdownSearch) {
          that._filterDropdownSearch.focus();
        }
      }, 0);
    }

    _closeFilterDropdown() {
      if (this._filterDropdownPanel) {
        this._filterDropdownPanel.style.display = "none";
      }

      if (this._filterDropdownSearch) {
        this._filterDropdownSearch.value = "";
      }

      if (this._filterDropdownList) {
        this._filterDropdownList.innerHTML = "";
      }

      this._filterDropdownOpen = false;
      this._activeFilterTrigger = null;
      this._activeFilterField = "";
      this._activeFilterOptions = [];
      this._activeFilterSelectedKey = "";
      this._filteredFilterOptions = [];
      this._filterDropdownRenderedCount = 0;
    }

    _applyFilterDropdownSearch(searchText) {
      var source = this._activeFilterOptions || [];
      var searchValue = String(searchText || "").toLowerCase().trim();
      var filtered = [];
      var i = 0;

      if (searchValue === "") {
        this._filteredFilterOptions = source.slice(0);
      } else {
        for (i = 0; i < source.length; i++) {
          if (source[i].searchText.indexOf(searchValue) > -1) {
            filtered.push(source[i]);
          }
        }
        this._filteredFilterOptions = filtered;
      }

      this._filterDropdownRenderedCount = 0;
      this._filterDropdownList.innerHTML = "";
      this._appendNextFilterDropdownBatch();
    }

    _appendNextFilterDropdownBatch() {
      if (!this._filterDropdownList || !this._filteredFilterOptions) {
        return;
      }

      var start = this._filterDropdownRenderedCount;
      var end = start + this._filterDropdownBatchSize;

      if (start >= this._filteredFilterOptions.length) {
        return;
      }

      var fragment = document.createDocumentFragment();
      var that = this;

      for (var i = start; i < end && i < this._filteredFilterOptions.length; i++) {
        var opt = this._filteredFilterOptions[i];
        var item = document.createElement("div");
        item.className = "dropdown-item";

        if (String(opt.key) === String(this._activeFilterSelectedKey)) {
          item.className += " selected";
        }

        item.textContent = opt.text;
        item.setAttribute("data-key", opt.key);

        item.addEventListener("mousedown", function (e) {
          e.preventDefault();
          var selectedKeyValue = this.getAttribute("data-key");
          that._setManageInlineFilter(that._activeFilterField, selectedKeyValue);
          that._closeFilterDropdown();
        });

        fragment.appendChild(item);
      }

      this._filterDropdownList.appendChild(fragment);
      this._filterDropdownRenderedCount = Math.min(end, this._filteredFilterOptions.length);

      if (this._filterDropdownRenderedCount < this._filteredFilterOptions.length) {
        if (!this._filterDropdownListMoreEl) {
          this._filterDropdownListMoreEl = document.createElement("div");
          this._filterDropdownListMoreEl.className = "dropdown-more";
        }

        this._filterDropdownListMoreEl.textContent =
          "Showing " + String(this._filterDropdownRenderedCount) + " of " + String(this._filteredFilterOptions.length);

        if (!this._filterDropdownListMoreEl.parentNode) {
          this._filterDropdownList.appendChild(this._filterDropdownListMoreEl);
        } else {
          this._filterDropdownList.appendChild(this._filterDropdownListMoreEl);
        }
      } else {
        if (this._filterDropdownListMoreEl && this._filterDropdownListMoreEl.parentNode) {
          this._filterDropdownListMoreEl.parentNode.removeChild(this._filterDropdownListMoreEl);
        }
      }

      if (this._filteredFilterOptions.length === 0) {
        this._filterDropdownList.innerHTML = '<div class="dropdown-empty">No results found</div>';
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

        var btnPasteExcel = this._shadowRoot.getElementById("btnPasteExcel");
        if (btnPasteExcel) {
          btnPasteExcel.addEventListener("click", function () {
            that._openPastePanel();
          });
        }

        var btnClosePastePanel = this._shadowRoot.getElementById("btnClosePastePanel");
        if (btnClosePastePanel) {
          btnClosePastePanel.addEventListener("click", function () {
            that._closePastePanel();
          });
        }

        var btnCancelPastePanel = this._shadowRoot.getElementById("btnCancelPastePanel");
        if (btnCancelPastePanel) {
          btnCancelPastePanel.addEventListener("click", function () {
            that._closePastePanel();
          });
        }

        var btnImportPastePanel = this._shadowRoot.getElementById("btnImportPastePanel");
        if (btnImportPastePanel) {
          btnImportPastePanel.addEventListener("click", function () {
            that._importPastePanelRows();
          });
        }

        var pastePanelOverlay = this._shadowRoot.getElementById("pasteModalOverlay");
        if (pastePanelOverlay) {
          pastePanelOverlay.addEventListener("click", function (e) {
            if (e.target && e.target.id === "pasteModalOverlay") {
              that._closePastePanel();
            }
          });
        }

        var pastePanelInput = this._shadowRoot.getElementById("pastePanelInput");
        if (pastePanelInput) {
          pastePanelInput.addEventListener("input", function () {
            that._pasteBuffer = this.value || "";
          });

          pastePanelInput.addEventListener("paste", function () {
            var area = this;
            setTimeout(function () {
              that._pasteBuffer = area.value || "";
            }, 0);
          });

          pastePanelInput.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
              e.preventDefault();
              that._closePastePanel();
              return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              that._importPastePanelRows();
            }
          });
        }

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
            var inputValue = this.value || "";

            if (that._manageIdSearchTimer) {
              clearTimeout(that._manageIdSearchTimer);
            }

            that._manageIdSearchTimer = setTimeout(function () {
              that._manageIdSearch = inputValue;
              that._manageCurrentPage = 1;
              that._rebuildManageFilteredIndexes();
              that._renderVisibleOnly();
            }, 120);
          });
        }

        var filterTriggerSegment = this._shadowRoot.getElementById("filterTriggerSegment");
        if (filterTriggerSegment) {
          filterTriggerSegment.addEventListener("click", function (e) {
            e.stopPropagation();
            that._openFilterDropdown(this, "SEGMENT");
          });
        }

        var filterTriggerHierarchy = this._shadowRoot.getElementById("filterTriggerHierarchy");
        if (filterTriggerHierarchy) {
          filterTriggerHierarchy.addEventListener("click", function (e) {
            e.stopPropagation();
            that._openFilterDropdown(this, "Hierarchy");
          });
        }

        var filterTriggerSnapshot = this._shadowRoot.getElementById("filterTriggerSnapshot");
        if (filterTriggerSnapshot) {
          filterTriggerSnapshot.addEventListener("click", function (e) {
            e.stopPropagation();
            that._openFilterDropdown(this, "SNAPSHOT");
          });
        }

        var btnLoadManage = this._shadowRoot.getElementById("btnLoadManage");
        if (btnLoadManage) btnLoadManage.addEventListener("click", function () { that.loadManageData(); });

        var btnSaveManage = this._shadowRoot.getElementById("btnSaveManage");
        if (btnSaveManage) btnSaveManage.addEventListener("click", function () { that.saveManageChanges(); });

        var btnDeleteManage = this._shadowRoot.getElementById("btnDeleteManage");
        if (btnDeleteManage) btnDeleteManage.addEventListener("click", function () { that.deleteManageData(); });

        var btnClearManage = this._shadowRoot.getElementById("btnClearManage");
        if (btnClearManage) btnClearManage.addEventListener("click", function () { that.clearManage(); });

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
      var grid = this._shadowRoot.getElementById("tbodyVirtual");
      if (!grid) {
        return;
      }

      var checkboxes = grid.querySelectorAll('.row-checkbox[data-type="checkbox"]');
      for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener("change", function () {
          var tabName = this.getAttribute("data-tab");
          var rowIndex = Number(this.getAttribute("data-row"));
          var fieldName = this.getAttribute("data-field");
          var rows = that._getRowsByTab(tabName);

          if (!rows[rowIndex]) {
            return;
          }

          rows[rowIndex][fieldName] = this.checked;
          if (tabName === "manage") {
            rows[rowIndex].isModified = true;
            rows[rowIndex].rowStatus = "CHANGED";
          }

          that._validationErrors = [];
          that._validationResult = "true";
          that._lastEvent = JSON.stringify({
            type: "rowSelect",
            tab: tabName,
            rowIndex: rowIndex,
            selected: this.checked
          });
          that._widgetStatus = "CHANGED";
          that._syncAll();
          that._refreshToolbarButtons();
          that._refreshSummaryOnly();
          that._fireSimpleEvent("onDataChange", {
            activeTab: that._activeTab,
            rows: that._rows,
            manageRows: that._manageRows
          });
        });
      }

      var triggers = grid.querySelectorAll('.dropdown-trigger[data-type="select"]');
      for (var j = 0; j < triggers.length; j++) {
        triggers[j].addEventListener("click", function (e) {
          e.stopPropagation();
          var tabName = this.getAttribute("data-tab");
          var rowIndex = Number(this.getAttribute("data-row"));
          var fieldName = this.getAttribute("data-field");
          that._openDropdown(this, tabName, rowIndex, fieldName);
        });
      }
    }

    _changeTabFromUI(tabName) {
      var normalizedTab = tabName === "manage" ? "manage" : "create";
      this._activeTab = normalizedTab;
      this._pastePanelOpen = false;
      this._pasteBuffer = "";

      if (normalizedTab === "manage") {
        this._rebuildManageFilteredIndexes();
      }

      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onTabChange", { activeTab: this._activeTab });
    }

    addRow() {
      if (this._activeTab !== "create") {
        return;
      }

      this._rows.push(this._createEmptyRow("NEW"));
      this._validationErrors = [];
      this._validationResult = "true";
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

      var clones = [];
      for (var i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected === true) {
          var copy = JSON.parse(JSON.stringify(this._rows[i]));
          copy.rowId = "ROW_" + String(this._rowSequence++);
          copy.selected = false;
          copy.isModified = true;
          copy.rowStatus = "NEW";
          clones.push(copy);
        }
      }

      if (clones.length === 0) {
        return;
      }

      for (var j = 0; j < clones.length; j++) {
        this._rows.push(clones[j]);
      }

      this._validationErrors = [];
      this._validationResult = "true";
      this._widgetStatus = "CHANGED";
      this._lastEvent = JSON.stringify({ type: "copyRows", tab: "create", copiedCount: clones.length });
      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, rows: this._rows });
    }

    deleteSelectedRows() {
      if (this._activeTab !== "create") {
        return;
      }

      var kept = [];
      var deleted = 0;
      for (var i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected === true) {
          deleted++;
        } else {
          kept.push(this._rows[i]);
        }
      }

      this._rows = kept.length > 0 ? kept : [this._createEmptyRow("NEW")];
      this._cleanupRowOptions("create");
      this._validationErrors = [];
      this._validationResult = "true";
      this._widgetStatus = "CHANGED";
      this._lastEvent = JSON.stringify({ type: "deleteRows", tab: "create", deletedCount: deleted });
      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, rows: this._rows });
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
        if (!row.SNAPSHOT) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "SNAPSHOT", message: "SNAPSHOT is mandatory" });
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
        return;
      }

      this._savePayload = JSON.parse(JSON.stringify(this._rows));
      this._lastEvent = JSON.stringify({
        type: "save",
        tab: "create",
        status: "SUCCESS",
        rowCount: this._savePayload.length
      });
      this._widgetStatus = "SAVED";
      this._syncAll();
      this._fireSimpleEvent("onSave", {
        activeTab: this._activeTab,
        savePayload: this._savePayload
      });
    }

    clear() {
      if (this._activeTab !== "create") {
        return;
      }

      this._rows = [this._createEmptyRow("NEW")];
      this._rowOptions = {};
      this._pastePanelOpen = false;
      this._pasteBuffer = "";
      this._validationErrors = [];
      this._validationResult = "true";
      this._savePayload = [];
      this._lastEvent = JSON.stringify({ type: "clear", tab: "create" });
      this._widgetStatus = "READY";
      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, rows: this._rows });
    }

    loadManageData() {
      this._lastEvent = JSON.stringify({ type: "loadManageData", tab: "manage" });
      this._widgetStatus = "LOADED";
      this._syncAll();
      this._fireSimpleEvent("onLoadManageData", { activeTab: this._activeTab });
    }

    saveManageChanges() {
      this._savePayload = JSON.parse(JSON.stringify(this._manageRows));
      this._lastEvent = JSON.stringify({
        type: "saveManageChanges",
        tab: "manage",
        rowCount: this._savePayload.length
      });
      this._widgetStatus = "SAVED";
      this._syncAll();
      this._fireSimpleEvent("onSaveManage", {
        activeTab: this._activeTab,
        savePayload: this._savePayload
      });
    }

    deleteManageData() {
      var visibleIndexes = this._getManagePagedIndexes();
      var deleteMap = {};
      var i = 0;

      for (i = 0; i < visibleIndexes.length; i++) {
        var idx = visibleIndexes[i];
        if (this._manageRows[idx] && this._manageRows[idx].selected === true) {
          deleteMap[idx] = true;
        }
      }

      var kept = [];
      var deletedCount = 0;
      for (i = 0; i < this._manageRows.length; i++) {
        if (deleteMap[i] === true) {
          deletedCount++;
        } else {
          kept.push(this._manageRows[i]);
        }
      }

      this._manageRows = kept;
      this._cleanupRowOptions("manage");
      this._rebuildManageFilteredIndexes();
      this._lastEvent = JSON.stringify({
        type: "deleteManageRows",
        tab: "manage",
        deletedCount: deletedCount
      });
      this._widgetStatus = "CHANGED";
      this._syncAll();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { activeTab: this._activeTab, manageRows: this._manageRows });
    }

    clearManage() {
      this._manageIdSearch = "";
      this._manageSegmentFilter = [];
      this._manageHierarchyFilter = [];
      this._manageSnapshotFilter = [];
      this._manageSegmentFilterMap = {};
      this._manageHierarchyFilterMap = {};
      this._manageSnapshotFilterMap = {};
      this._manageCurrentPage = 1;
      this._rebuildManageFilteredIndexes();
      this._lastEvent = JSON.stringify({ type: "clearManage", tab: "manage" });
      this._widgetStatus = "READY";
      this._syncAll();
      this._refreshTable();
    }

    setRows(rowsJson) {
      var oldRows = this._rows.slice(0);
      try {
        this._rows = JSON.parse(rowsJson || "[]");
        if (!Array.isArray(this._rows)) {
          this._rows = [];
        }
      } catch (e) {
        this._rows = [];
      }

      if (this._rows.length === 0) {
        this._rows = [this._createEmptyRow("NEW")];
      }

      this._normalizeAllRows(this._rows, "NEW");
      this._rebuildRowOptionsAfterRowChange("create", oldRows, this._rows);
      this._cleanupRowOptions("create");
      this._widgetStatus = "LOADED";
      this._syncAll();
      this._refreshTable();
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
      this._pastePanelOpen = false;
      this._pasteBuffer = "";
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
          if (rows[i].selected === true) {
            count++;
          }
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
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setGlAccountOptions(json) {
      this.setGLAccountOptions(json);
    }

    setCostCenterOptions(json) {
      this._costCenterOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setProfitCenterOptions(json) {
      this._profitCenterOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setSegmentOptions(json) {
      this._segmentOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setHierarchyOptions(json) {
      this._hierarchyOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setSnapshotOptions(json) {
      this._snapshotOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setManagementMappingOptions(json) {
      this._managementMappingOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setManagementSubMappingOptions(json) {
      this._managementSubMappingOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setGlAccountDropdownOptionsOnly(optionsStr) {
      try {
        var optionsArray = JSON.parse(optionsStr || "[]");

        if (!Array.isArray(optionsArray)) {
          optionsArray = [];
        }

        this._glAccountOptions = this._parseOptions(JSON.stringify(optionsArray));
        this._syncAll();
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
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
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
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
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
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
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
      } catch (e) {}
    }

    setSnapshotDropdownOptionsOnly(optionsStr) {
      try {
        var optionsArray = JSON.parse(optionsStr || "[]");

        if (!Array.isArray(optionsArray)) {
          optionsArray = [];
        }

        this._snapshotOptions = this._parseOptions(JSON.stringify(optionsArray));
        this._syncAll();
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
      } catch (e) {}
    }

    setManageGlAccountFilter(filterStr) {
      try {
        var filterArray = JSON.parse(filterStr || "[]");

        if (!Array.isArray(filterArray)) {
          filterArray = [];
        }

        var cleanedFilter = [];
        for (var i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);
          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageGlAccountFilter = cleanedFilter;
        this._manageGlAccountFilterMap = this._buildFilterMap(cleanedFilter);
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageGlAccountFilter = [];
        this._manageGlAccountFilterMap = {};
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
        for (var i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);
          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageCostCenterFilter = cleanedFilter;
        this._manageCostCenterFilterMap = this._buildFilterMap(cleanedFilter);
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageCostCenterFilter = [];
        this._manageCostCenterFilterMap = {};
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
        for (var i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);
          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageProfitCenterFilter = cleanedFilter;
        this._manageProfitCenterFilterMap = this._buildFilterMap(cleanedFilter);
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageProfitCenterFilter = [];
        this._manageProfitCenterFilterMap = {};
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
        for (var i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);
          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageSegmentFilter = cleanedFilter;
        this._manageSegmentFilterMap = this._buildFilterMap(cleanedFilter);
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageSegmentFilter = [];
        this._manageSegmentFilterMap = {};
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      }
    }

    setManageSnapshotFilter(filterStr) {
      try {
        var filterArray = JSON.parse(filterStr || "[]");

        if (!Array.isArray(filterArray)) {
          filterArray = [];
        }

        var cleanedFilter = [];
        for (var i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);
          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageSnapshotFilter = cleanedFilter;
        this._manageSnapshotFilterMap = this._buildFilterMap(cleanedFilter);
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageSnapshotFilter = [];
        this._manageSnapshotFilterMap = {};
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      }
    }
  }

  customElements.define("project-entry-widget", ProjectEntryWidget);
})();




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
      this._snapshotOptions = [];
      this._managementMappingOptions = [];
      this._managementSubMappingOptions = [];

      this._rowOptions = {};
      this._manageRowOptions = {};

      this._manageGlAccountFilter = [];
      this._manageCostCenterFilter = [];
      this._manageProfitCenterFilter = [];
      this._manageSegmentFilter = [];
      this._manageSnapshotFilter = [];

      this._manageGlAccountFilterMap = {};
      this._manageCostCenterFilterMap = {};
      this._manageProfitCenterFilterMap = {};
      this._manageSegmentFilterMap = {};
      this._manageSnapshotFilterMap = {};

      this._manageIdSearch = "";
      this._manageIdSearchTimer = null;
      this._filteredManageIndexes = [];
      this._managePageSize = 100;
      this._manageCurrentPage = 1;

      this._dropdownPanel = null;
      this._dropdownSearch = null;
      this._dropdownList = null;
      this._dropdownCloseBtn = null;
      this._dropdownClearBtn = null;
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
        { key: "ID", label: "ID", type: "readonly", width: "250px" },
        { key: "MANAGEMENT_SUB_MAPPING", label: "MANAGEMENT SUB-MAPPING", type: "select", width: "250px" },
        { key: "MANAGEMENT_MAPPING", label: "MANAGEMENT MAPPING", type: "select", width: "230px" },
        { key: "Hierarchy", label: "Hierarchy", type: "select", width: "220px" },
        { key: "SNAPSHOT", label: "SNAPSHOT", type: "select", width: "180px" }
      ];

      this._manageColumns = [
        { key: "selected", label: "Sel", type: "checkbox", width: "70px" },
        { key: "ID", label: "ID", type: "readonly", width: "250px" },
        { key: "GLACCOUNT", label: "GLACCOUNT", type: "readonly", width: "180px" },
        { key: "COSTCENTER", label: "COSTCENTER", type: "readonly", width: "180px" },
        { key: "PROFITCENTER", label: "PROFITCENTER", type: "readonly", width: "180px" },
        { key: "SEGMENT", label: "SEGMENT", type: "readonly", width: "140px" },
        { key: "MANAGEMENT_SUB_MAPPING", label: "MANAGEMENT SUB-MAPPING", type: "select", width: "250px" },
        { key: "MANAGEMENT_MAPPING", label: "MANAGEMENT MAPPING", type: "select", width: "230px" },
        { key: "Hierarchy", label: "Hierarchy", type: "select", width: "220px" },
        { key: "SNAPSHOT", label: "SNAPSHOT", type: "select", width: "180px" }
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

      if (this._manageIdSearchTimer) {
        clearTimeout(this._manageIdSearchTimer);
        this._manageIdSearchTimer = null;
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
        "snapshotOptions",
        "managementMappingOptions",
        "managementSubMappingOptions",
        "manageGlAccountFilter",
        "manageCostCenterFilter",
        "manageProfitCenterFilter",
        "manageSegmentFilter",
        "manageSnapshotFilter"
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
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "costCenterOptions") {
        this._costCenterOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "profitCenterOptions") {
        this._profitCenterOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "segmentOptions") {
        this._segmentOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "hierarchyOptions") {
        this._hierarchyOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "snapshotOptions") {
        this._snapshotOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "managementMappingOptions") {
        this._managementMappingOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
        return;
      }

      if (name === "managementSubMappingOptions") {
        this._managementSubMappingOptions = this._parseOptions(newValue);
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
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

      if (name === "manageSnapshotFilter") {
        this.setManageSnapshotFilter(newValue || "[]");
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
        Hierarchy: "",
        SNAPSHOT: ""
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
      row.SNAPSHOT = this._safeString(row.SNAPSHOT);

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
      if (value === undefined || value === null || value === "undefined") {
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

    _buildFilterMap(filterArray) {
      var map = {};
      if (!filterArray || !filterArray.length) {
        return map;
      }

      for (var i = 0; i < filterArray.length; i++) {
        var val = this._safeString(filterArray[i]);
        if (val !== "") {
          map[val] = true;
        }
      }

      return map;
    }

    _isValueInFilterMap(filterArray, filterMap, value) {
      if (!filterArray || filterArray.length === 0) {
        return true;
      }

      var cleanValue = this._safeString(value);
      return filterMap[cleanValue] === true;
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

    _isManageRowVisible(rowData) {
      if (!rowData) {
        return false;
      }

      if (!this._isValueInFilterMap(this._manageGlAccountFilter, this._manageGlAccountFilterMap, rowData.GLACCOUNT)) {
        return false;
      }

      if (!this._isValueInFilterMap(this._manageCostCenterFilter, this._manageCostCenterFilterMap, rowData.COSTCENTER)) {
        return false;
      }

      if (!this._isValueInFilterMap(this._manageProfitCenterFilter, this._manageProfitCenterFilterMap, rowData.PROFITCENTER)) {
        return false;
      }

      if (!this._isValueInFilterMap(this._manageSegmentFilter, this._manageSegmentFilterMap, rowData.SEGMENT)) {
        return false;
      }

      if (!this._isValueInFilterMap(this._manageSnapshotFilter, this._manageSnapshotFilterMap, rowData.SNAPSHOT)) {
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
        : (function (length) {
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
      var shouldShowError = tabName === "create" || (tabName === "manage" && column.key === "ID");
      var hasError = shouldShowError && this._hasFieldError(column.key, rowErrors);
      var errorCss = hasError ? "error" : "";

      if (column.type === "checkbox") {
        return '<input class="row-checkbox ' + errorCss + '" data-tab="' + tabName + '" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="checkbox" type="checkbox" ' + (value === true ? 'checked' : '') + ' />';
      }

      if (column.type === "readonly") {
        return '<div class="readonly-cell" data-tab="' + tabName + '" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="readonly">' + this._escape(String(value)) + '</div>' + (shouldShowError ? this._renderFieldErrors(column.key, rowErrors) : "");
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
          + (shouldShowError ? this._renderFieldErrors(column.key, rowErrors) : "");
      }

      return "";
    }

    _getGlobalOptionsForField(fieldName) {
      if (fieldName === "GLACCOUNT") return this._glAccountOptions || [];
      if (fieldName === "COSTCENTER") return this._costCenterOptions || [];
      if (fieldName === "PROFITCENTER") return this._profitCenterOptions || [];
      if (fieldName === "SEGMENT") return this._segmentOptions || [];
      if (fieldName === "Hierarchy") return this._hierarchyOptions || [];
      if (fieldName === "SNAPSHOT") return this._snapshotOptions || [];
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

  // fallback: if saved value exists in dimension but not in current dropdown options,
  // still display the raw saved value instead of "Select"
  return valueStr;
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
          '<button type="button" class="dropdown-close-btn" title="Close">×</button>' +
        '</div>' +
        '<div class="dropdown-actions">' +
          '<button type="button" class="dropdown-clear-btn">Clear selection</button>' +
        '</div>' +
        '<div class="dropdown-list"></div>';

      document.body.appendChild(dropdownPanel);

      this._dropdownPanel = dropdownPanel;
      this._dropdownSearch = dropdownPanel.querySelector(".dropdown-search-input");
      this._dropdownList = dropdownPanel.querySelector(".dropdown-list");
      this._dropdownCloseBtn = dropdownPanel.querySelector(".dropdown-close-btn");
      this._dropdownClearBtn = dropdownPanel.querySelector(".dropdown-clear-btn");

      var that = this;

      this._dropdownCloseBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        that._closeDropdown();
      });

      this._dropdownClearBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        var rowIndex = that._activeDropdownRow;
        var fieldName = that._activeDropdownField;
        var tabName = that._activeDropdownTab;
        var rows = that._getRowsByTab(tabName);

        if (!rows[rowIndex]) {
          that._closeDropdown();
          return;
        }

        rows[rowIndex][fieldName] = "";

        if (fieldName === "MANAGEMENT_SUB_MAPPING") {
          rows[rowIndex]["Hierarchy"] = "";

          if (tabName === "manage") {
            that._setRowOptionsForField("manage", rowIndex, "Hierarchy", []);
          } else {
            that._setRowOptionsForField("create", rowIndex, "Hierarchy", []);
          }
        }

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
        that._fireSimpleEvent("onFieldChange", {
          tab: tabName,
          rowIndex: rowIndex,
          field: fieldName,
          value: ""
        });
        that._fireSimpleEvent("onDataChange", {
          activeTab: that._activeTab,
          rows: that._rows,
          manageRows: that._manageRows
        });
        that._closeDropdown();
      });

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

      if (this._dropdownClearBtn) {
        if (this._activeDropdownSelectedKey && String(this._activeDropdownSelectedKey).trim() !== "") {
          this._dropdownClearBtn.style.display = "block";
        } else {
          this._dropdownClearBtn.style.display = "none";
        }
      }

      var triggerRect = triggerEl.getBoundingClientRect();
      var dropdownWidth = Math.max(triggerRect.width, 320);
      var dropdownHeight = 380;
      var gap = 4;

      var spaceBelow = window.innerHeight - triggerRect.bottom;
      var spaceAbove = triggerRect.top;

      var dropdownTop = triggerRect.bottom + gap;
      var dropdownLeft = triggerRect.left;

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        dropdownTop = triggerRect.top - dropdownHeight - gap;
      }

      if (dropdownTop < 10) {
        dropdownTop = 10;
      }

      if (dropdownTop + dropdownHeight > window.innerHeight - 10) {
        dropdownTop = window.innerHeight - dropdownHeight - 10;
      }

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
      this._dropdownPanel.style.maxHeight = dropdownHeight + "px";
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

      if (this._dropdownSearch) {
        this._dropdownSearch.value = "";
      }

      if (this._dropdownList) {
        this._dropdownList.innerHTML = "";
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
            var inputValue = this.value || "";

            if (that._manageIdSearchTimer) {
              clearTimeout(that._manageIdSearchTimer);
            }

            that._manageIdSearchTimer = setTimeout(function () {
              that._manageIdSearch = inputValue;
              that._manageCurrentPage = 1;
              that._rebuildManageFilteredIndexes();
              that._renderVisibleOnly();
            }, 120);
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
            manageSegmentFilter: JSON.stringify(this._manageSegmentFilter || []),
            manageSnapshotFilter: JSON.stringify(this._manageSnapshotFilter || [])
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
            Hierarchy: this._rows[i].Hierarchy || "",
            SNAPSHOT: this._rows[i].SNAPSHOT || ""
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
        if (!row.SNAPSHOT) {
          errors.push({ tab: "create", rowIndex: rowIndex, field: "SNAPSHOT", message: "SNAPSHOT is mandatory" });
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
            Hierarchy: this._rows[i].Hierarchy,
            SNAPSHOT: this._rows[i].SNAPSHOT
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
            SNAPSHOT: this._manageRows[i].SNAPSHOT,
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
            SNAPSHOT: this._manageRows[i].SNAPSHOT,
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
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setGlAccountOptions(json) {
      this.setGLAccountOptions(json);
    }

    setCostCenterOptions(json) {
      this._costCenterOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setProfitCenterOptions(json) {
      this._profitCenterOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setSegmentOptions(json) {
      this._segmentOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setHierarchyOptions(json) {
      this._hierarchyOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setSnapshotOptions(json) {
      this._snapshotOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setManagementMappingOptions(json) {
      this._managementMappingOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setManagementSubMappingOptions(json) {
      this._managementSubMappingOptions = this._parseOptions(json);
      this._renderVisibleOnly();
      this._refreshSummaryOnly();
    }

    setGlAccountDropdownOptionsOnly(optionsStr) {
      try {
        var optionsArray = JSON.parse(optionsStr || "[]");

        if (!Array.isArray(optionsArray)) {
          optionsArray = [];
        }

        this._glAccountOptions = this._parseOptions(JSON.stringify(optionsArray));
        this._syncAll();
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
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
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
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
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
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
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
      } catch (e) {}
    }

    setSnapshotDropdownOptionsOnly(optionsStr) {
      try {
        var optionsArray = JSON.parse(optionsStr || "[]");

        if (!Array.isArray(optionsArray)) {
          optionsArray = [];
        }

        this._snapshotOptions = this._parseOptions(JSON.stringify(optionsArray));
        this._syncAll();
        this._renderVisibleOnly();
        this._refreshSummaryOnly();
      } catch (e) {}
    }

    setManageGlAccountFilter(filterStr) {
      try {
        var filterArray = JSON.parse(filterStr || "[]");

        if (!Array.isArray(filterArray)) {
          filterArray = [];
        }

        var cleanedFilter = [];
        for (var i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);
          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageGlAccountFilter = cleanedFilter;
        this._manageGlAccountFilterMap = this._buildFilterMap(cleanedFilter);
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageGlAccountFilter = [];
        this._manageGlAccountFilterMap = {};
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
        for (var i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);
          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageCostCenterFilter = cleanedFilter;
        this._manageCostCenterFilterMap = this._buildFilterMap(cleanedFilter);
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageCostCenterFilter = [];
        this._manageCostCenterFilterMap = {};
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
        for (var i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);
          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageProfitCenterFilter = cleanedFilter;
        this._manageProfitCenterFilterMap = this._buildFilterMap(cleanedFilter);
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageProfitCenterFilter = [];
        this._manageProfitCenterFilterMap = {};
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
        for (var i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);
          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageSegmentFilter = cleanedFilter;
        this._manageSegmentFilterMap = this._buildFilterMap(cleanedFilter);
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageSegmentFilter = [];
        this._manageSegmentFilterMap = {};
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      }
    }

    setManageSnapshotFilter(filterStr) {
      try {
        var filterArray = JSON.parse(filterStr || "[]");

        if (!Array.isArray(filterArray)) {
          filterArray = [];
        }

        var cleanedFilter = [];
        for (var i = 0; i < filterArray.length; i++) {
          var cleanValue = this._safeString(filterArray[i]);
          if (cleanValue !== "" && cleanValue !== "ALL") {
            cleanedFilter.push(cleanValue);
          }
        }

        this._manageSnapshotFilter = cleanedFilter;
        this._manageSnapshotFilterMap = this._buildFilterMap(cleanedFilter);
        this._manageCurrentPage = 1;
        this._rebuildManageFilteredIndexes();
        this._syncAll();
        this._refreshTable();
      } catch (e) {
        this._manageSnapshotFilter = [];
        this._manageSnapshotFilterMap = {};
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

  // Important:
  // Do not clear current manage value if it is not part of filtered dropdown options.
  // Loaded dimension property values must remain visible and editable.

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
        'max-height:380px;' +
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
        'padding:0;' +
        'border-bottom:none;' +
        'background:#ffffff;' +
        'flex:1 1 auto;' +
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
      '.project-widget-dropdown-panel .dropdown-close-btn {' +
        'width:32px;' +
        'height:32px;' +
        'border:1px solid #b9cae0;' +
        'border-radius:6px;' +
        'background:#ffffff;' +
        'color:#5f6f82;' +
        'font-size:18px;' +
        'line-height:1;' +
        'cursor:pointer;' +
        'flex:0 0 auto;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-close-btn:hover {' +
        'background:#f3f8fd;' +
        'color:#223548;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-actions {' +
        'padding:6px 8px;' +
        'border-bottom:1px solid #e8eef5;' +
        'background:#ffffff;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-clear-btn {' +
        'width:100%;' +
        'height:28px;' +
        'border:1px solid #c7d7ea;' +
        'border-radius:6px;' +
        'background:#ffffff;' +
        'color:#0a6ed1;' +
        'font-size:12px;' +
        'font-weight:600;' +
        'cursor:pointer;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-clear-btn:hover {' +
        'background:#f3f8fd;' +
      '}' +
      '.project-widget-dropdown-panel .dropdown-list {' +
        'max-height:240px;' +
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
        'padding:6px 10px;' +
        'font-size:12px;' +
        'color:#6b7c8f;' +
        'text-align:center;' +
        'background:#fafcff;' +
        'border-top:1px solid #eef3f8;' +
      '}';
    document.head.appendChild(globalStyleEl);
  })();
})();
*/



