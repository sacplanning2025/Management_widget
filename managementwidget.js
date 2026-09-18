
/*(function () {
  class ProjectEntryWidget extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });

      this._rows = [];
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

      this._dropdownPanel = null;
      this._dropdownSearch = null;
      this._dropdownList = null;
      this._dropdownOpen = false;
      this._activeDropdownTrigger = null;
      this._activeDropdownRow = -1;
      this._activeDropdownField = "";
      this._activeDropdownOptions = [];
      this._activeDropdownSelectedKey = "";

      this._filteredDropdownOptions = [];
      this._dropdownBatchSize = 100;
      this._dropdownRenderedCount = 0;
      this._dropdownSearchTimer = null;
      this._dropdownListMoreEl = null;

      this._columns = [
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

      this._render();
    }

    connectedCallback() {
      if (!this._rows || this._rows.length === 0) {
        this._rows = [this._createEmptyRow()];
      }

      this._createDropdownPanel();
      this._normalizeAllRows();
      this._syncRows();
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
        "managementSubMappingOptions"
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
    }

    _createEmptyRow() {
      return {
        rowId: "ROW_" + String(this._rowSequence++),
        selected: false,
        isModified: false,
        rowStatus: "NEW",
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

    _normalizeRow(row) {
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
        row.rowStatus = "LOADED";
      }

      row.GLACCOUNT = this._safeString(row.GLACCOUNT);
      row.COSTCENTER = this._safeString(row.COSTCENTER);
      row.PROFITCENTER = this._safeString(row.PROFITCENTER);
      row.SEGMENT = this._safeString(row.SEGMENT);
      row.ID = this._safeString(row.ID);
      row.MANAGEMENT_SUB_MAPPING = this._safeString(row.MANAGEMENT_SUB_MAPPING);
      row.MANAGEMENT_MAPPING = this._safeString(row.MANAGEMENT_MAPPING);
      row.Hierarchy = this._safeString(row.Hierarchy);

      this._updateRowId(row);
    }

    _normalizeAllRows() {
      for (var i = 0; i < this._rows.length; i++) {
        this._normalizeRow(this._rows[i]);
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
          .toolbar { display:flex; justify-content:flex-end; gap:8px; padding:12px; border-bottom:1px solid #e5edf7; background:#f8fbff; flex-wrap:wrap; }
          .btn { border:1px solid #c7d7ea; background:#ffffff; color:#0a6ed1; border-radius:8px; padding:8px 14px; cursor:pointer; font-weight:600; font-size:13px; }
          .btn:hover { background:#f3f8fd; }
          .btn.primary { background:#0a6ed1; color:#ffffff; border-color:#0a6ed1; }
          .btn.danger { color:#bb1e1e; border-color:#efb4b4; background:#fff7f7; }
          .gridWrap { overflow:auto; max-height:520px; background:#ffffff; }
          table { border-collapse:separate; border-spacing:0; width:max-content; min-width:100%; }
          th, td { border-bottom:1px solid #edf2f7; padding:8px; vertical-align:top; white-space:nowrap; }
          th { position:sticky; top:0; background:#eef4fb; z-index:1; text-align:left; font-size:12px; color:#223548; font-weight:700; }
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
        </style>
        <div class="wrap" id="widgetWrap"></div>
      `;
    }

    _hasSelectedRows() {
      for (var i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected === true) {
          return true;
        }
      }
      return false;
    }

    _areAllRowsSelected() {
      if (!this._rows || this._rows.length === 0) {
        return false;
      }

      for (var i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected !== true) {
          return false;
        }
      }
      return true;
    }

    _toggleSelectAll(checked) {
      for (var i = 0; i < this._rows.length; i++) {
        this._rows[i].selected = checked;
      }

      this._validationErrors = [];
      this._validationResult = "true";
      this._lastEvent = JSON.stringify({ type: "selectAll", selected: checked });
      this._widgetStatus = "CHANGED";
      this._syncRows();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { rows: this._rows });
    }

    _refreshStatusBarHtml() {
      return `
        <div class="summary">
          <div>Total Rows: ${this.getRowCount()}</div>
          <div>Selected Rows: ${this.getSelectedRowCount()}</div>
          <div>Validation: ${this._validationResult}</div>
          <div>Status: ${this._widgetStatus}</div>
        </div>
      `;
    }

    _refreshTable() {
      var container = this._shadowRoot.getElementById("widgetWrap");
      var hasSelection = this._hasSelectedRows();
      var allSelected = this._areAllRowsSelected();
      var rowErrorMap = this._getRowErrorMap();

      var html = '';
      html += '<div class="toolbar">';
      html += '<button class="btn" id="btnAdd">Add Row</button>';

      if (hasSelection) {
        html += '<button class="btn" id="btnCopy">Copy</button>';
        html += '<button class="btn danger" id="btnDelete">Delete Selected</button>';
      }

      html += '<button class="btn" id="btnValidate">Validate</button>';
      html += '<button class="btn primary" id="btnSave">Save</button>';
      html += '<button class="btn" id="btnClear">Clear</button>';
      html += '</div>';

      html += '<div class="gridWrap" id="gridWrap">';
      html += '<table>';
      html += '<thead><tr>';

      for (var h = 0; h < this._columns.length; h++) {
        var col = this._columns[h];
        if (col.key === "selected") {
          html += '<th style="width:' + col.width + '"><div class="select-all-wrap"><span>Sel</span><input class="select-all-checkbox" type="checkbox" id="selectAll" ' + (allSelected ? 'checked' : '') + ' /></div></th>';
        } else {
          html += '<th style="width:' + col.width + '">' + col.label + '</th>';
        }
      }

      html += '</tr></thead><tbody>';

      for (var i = 0; i < this._rows.length; i++) {
        var row = this._rows[i];
        var rowErrors = rowErrorMap[i] || [];
        var rowClass = "";

        if (rowErrors.length) {
          rowClass = "errorRow";
        } else if (row.isModified === true) {
          rowClass = "modifiedRow";
        }

        html += '<tr class="' + rowClass + '">';

        for (var c = 0; c < this._columns.length; c++) {
          html += '<td style="width:' + this._columns[c].width + '">' + this._renderCell(row, i, this._columns[c], rowErrors) + '</td>';
        }

        html += '</tr>';
      }

      html += '</tbody></table></div>';
      html += this._refreshStatusBarHtml();

      var oldGrid = this._shadowRoot.getElementById("gridWrap");
      var oldLeft = oldGrid ? oldGrid.scrollLeft : 0;
      var oldTop = oldGrid ? oldGrid.scrollTop : 0;

      container.innerHTML = html;
      this._bindEvents();

      var newGrid = this._shadowRoot.getElementById("gridWrap");
      if (newGrid) {
        newGrid.scrollLeft = oldLeft;
        newGrid.scrollTop = oldTop;
      }
    }

    _renderCell(row, rowIndex, column, rowErrors) {
      var value = row[column.key] !== undefined && row[column.key] !== null ? row[column.key] : "";
      var hasError = this._hasFieldError(column.key, rowErrors);
      var errorCss = hasError ? "error" : "";

      if (column.type === "checkbox") {
        return '<input class="row-checkbox ' + errorCss + '" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="checkbox" type="checkbox" ' + (value === true ? 'checked' : '') + ' />';
      }

      if (column.type === "readonly") {
        return '<div class="readonly-cell" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="readonly">' + this._escape(String(value)) + '</div>' + this._renderFieldErrors(column.key, rowErrors);
      }

      if (column.type === "select") {
        var displayText = this._getOptionText(column.key, value);
        if (!displayText) {
          displayText = "Select";
        }

        return ''
          + '<div class="dropdown-trigger ' + errorCss + '" tabindex="0" data-row="' + rowIndex + '" data-field="' + column.key + '" data-type="select">'
          + '<span class="label">' + this._escape(String(displayText)) + '</span>'
          + '<span class="arrow">▼</span>'
          + '</div>'
          + this._renderFieldErrors(column.key, rowErrors);
      }

      return "";
    }

    _getOptionsForField(fieldName) {
      if (fieldName === "GLACCOUNT") return this._glAccountOptions || [];
      if (fieldName === "COSTCENTER") return this._costCenterOptions || [];
      if (fieldName === "PROFITCENTER") return this._profitCenterOptions || [];
      if (fieldName === "SEGMENT") return this._segmentOptions || [];
      if (fieldName === "Hierarchy") return this._hierarchyOptions || [];
      if (fieldName === "MANAGEMENT_MAPPING") return this._managementMappingOptions || [];
      if (fieldName === "MANAGEMENT_SUB_MAPPING") return this._managementSubMappingOptions || [];
      return [];
    }

    _getOptionText(fieldName, value) {
      var options = this._getOptionsForField(fieldName);
      var valueStr = String(value || "");

      for (var i = 0; i < options.length; i++) {
        if (String(options[i].key) === valueStr) {
          return options[i].text;
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

    _openDropdown(triggerEl, rowIndex, fieldName) {
      this._createDropdownPanel();

      this._activeDropdownTrigger = triggerEl;
      this._activeDropdownRow = rowIndex;
      this._activeDropdownField = fieldName;
      this._activeDropdownOptions = this._getOptionsForField(fieldName) || [];
      this._activeDropdownSelectedKey = this._rows[rowIndex] ? this._rows[rowIndex][fieldName] : "";

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

          if (!that._rows[rowIndex]) {
            that._closeDropdown();
            return;
          }

          that._rows[rowIndex][fieldName] = selectedKeyValue;
          that._updateRowId(that._rows[rowIndex]);
          that._rows[rowIndex].isModified = true;
          that._rows[rowIndex].rowStatus = "CHANGED";
          that._validationErrors = [];
          that._validationResult = "true";
          that._widgetStatus = "CHANGED";
          that._lastEvent = JSON.stringify({
            type: "fieldChange",
            rowIndex: rowIndex,
            field: fieldName,
            value: selectedKeyValue
          });

          that._syncRows();
          that._refreshTable();
          that._fireSimpleEvent("onFieldChange", { rowIndex: rowIndex, field: fieldName, value: selectedKeyValue });
          that._fireSimpleEvent("onDataChange", { rows: that._rows });
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

      var selectAll = this._shadowRoot.getElementById("selectAll");
      if (selectAll) {
        selectAll.addEventListener("change", function () {
          that._toggleSelectAll(selectAll.checked);
        });
      }

      var allElements = this._shadowRoot.querySelectorAll("[data-row][data-field]");
      Array.prototype.forEach.call(allElements, function (el) {
        var type = el.getAttribute("data-type");

        if (type === "checkbox") {
          el.addEventListener("change", function () {
            var rowIndex = parseInt(this.getAttribute("data-row"), 10);
            var fieldName = this.getAttribute("data-field");
            var value = this.checked;

            that._rows[rowIndex][fieldName] = value;
            that._rows[rowIndex].isModified = true;
            that._rows[rowIndex].rowStatus = "CHANGED";
            that._validationErrors = [];
            that._validationResult = "true";
            that._widgetStatus = "CHANGED";
            that._lastEvent = JSON.stringify({
              type: "fieldChange",
              rowIndex: rowIndex,
              field: fieldName,
              value: value
            });

            that._syncRows();
            that._refreshTable();
            that._fireSimpleEvent("onFieldChange", { rowIndex: rowIndex, field: fieldName, value: value });
            that._fireSimpleEvent("onDataChange", { rows: that._rows });
          });
          return;
        }

        if (type === "select") {
          el.addEventListener("click", function (e) {
            e.stopPropagation();
            var rowIndex = parseInt(this.getAttribute("data-row"), 10);
            var fieldName = this.getAttribute("data-field");
            that._openDropdown(this, rowIndex, fieldName);
          });

          el.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              var rowIndex = parseInt(this.getAttribute("data-row"), 10);
              var fieldName = this.getAttribute("data-field");
              that._openDropdown(this, rowIndex, fieldName);
            }
          });
        }
      });
    }

    _fireSimpleEvent(name, detail) {
      this.dispatchEvent(new CustomEvent(name, { detail: detail }));
    }

    _firePropertiesChanged() {
      this.dispatchEvent(new CustomEvent("propertiesChanged", {
        detail: {
          properties: {
            rows: JSON.stringify(this._rows),
            lastEvent: this._lastEvent,
            validationResult: this._validationResult,
            validationErrors: JSON.stringify(this._validationErrors || []),
            savePayload: JSON.stringify(this._savePayload || []),
            rowCount: this.getRowCount(),
            selectedRowCount: this.getSelectedRowCount(),
            widgetStatus: this._widgetStatus
          }
        }
      }));
    }

    _syncRows() {
      this._firePropertiesChanged();
    }

    addRow() {
      this._rows.push(this._createEmptyRow());
      this._widgetStatus = "CHANGED";
      this._lastEvent = JSON.stringify({ type: "addRow" });
      this._syncRows();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { rows: this._rows });
    }

    copySelectedRows() {
      var copiedRows = [];

      for (var i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected === true) {
          copiedRows.push({
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
          });
        }
      }

      if (!copiedRows.length) {
        return;
      }

      for (var j = 0; j < copiedRows.length; j++) {
        this._updateRowId(copiedRows[j]);
        this._rows.push(copiedRows[j]);
      }

      this._validationErrors = [];
      this._validationResult = "true";
      this._widgetStatus = "CHANGED";
      this._lastEvent = JSON.stringify({ type: "copySelectedRows", copiedCount: copiedRows.length });
      this._syncRows();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { rows: this._rows });
    }

    deleteSelectedRows() {
      var remainingRows = [];

      for (var i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected !== true) {
          remainingRows.push(this._rows[i]);
        }
      }

      if (!remainingRows.length) {
        remainingRows = [this._createEmptyRow()];
      }

      this._rows = remainingRows;
      this._normalizeAllRows();
      this._validationErrors = [];
      this._validationResult = "true";
      this._widgetStatus = "CHANGED";
      this._lastEvent = JSON.stringify({ type: "deleteSelectedRows" });
      this._syncRows();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { rows: this._rows });
    }

    clear() {
      this._rows = [this._createEmptyRow()];
      this._validationErrors = [];
      this._validationResult = "true";
      this._savePayload = [];
      this._lastEvent = JSON.stringify({ type: "clear" });
      this._widgetStatus = "READY";
      this._syncRows();
      this._refreshTable();
      this._fireSimpleEvent("onDataChange", { rows: this._rows });
    }

    validate() {
      var errors = [];
      var idMap = {};

      for (var i = 0; i < this._rows.length; i++) {
        var row = this._rows[i];
        var rowIndex = i + 1;

        if (!row.GLACCOUNT) {
          errors.push({ rowIndex: rowIndex, field: "GLACCOUNT", message: "GLACCOUNT is mandatory" });
        }
        if (!row.COSTCENTER) {
          errors.push({ rowIndex: rowIndex, field: "COSTCENTER", message: "COSTCENTER is mandatory" });
        }
        if (!row.PROFITCENTER) {
          errors.push({ rowIndex: rowIndex, field: "PROFITCENTER", message: "PROFITCENTER is mandatory" });
        }
        if (!row.SEGMENT) {
          errors.push({ rowIndex: rowIndex, field: "SEGMENT", message: "SEGMENT is mandatory" });
        }
        if (!row.Hierarchy) {
          errors.push({ rowIndex: rowIndex, field: "Hierarchy", message: "Hierarchy is mandatory" });
        }
        if (!row.MANAGEMENT_MAPPING) {
          errors.push({ rowIndex: rowIndex, field: "MANAGEMENT_MAPPING", message: "MANAGEMENT MAPPING is mandatory" });
        }
        if (!row.MANAGEMENT_SUB_MAPPING) {
          errors.push({ rowIndex: rowIndex, field: "MANAGEMENT_SUB_MAPPING", message: "MANAGEMENT SUB-MAPPING is mandatory" });
        }

        this._updateRowId(row);

        if (!row.ID) {
          errors.push({ rowIndex: rowIndex, field: "ID", message: "ID could not be generated" });
        }

        if (row.ID) {
          if (idMap[row.ID]) {
            errors.push({ rowIndex: rowIndex, field: "ID", message: "Duplicate ID found" });
          } else {
            idMap[row.ID] = true;
          }
        }
      }

      this._validationErrors = errors;
      this._validationResult = errors.length === 0 ? "true" : "false";
      this._lastEvent = JSON.stringify({
        type: "validate",
        validationResult: this._validationResult,
        errorCount: errors.length
      });
      this._widgetStatus = errors.length === 0 ? "VALID" : "ERROR";

      this._syncRows();
      this._refreshTable();
      this._fireSimpleEvent("onValidate", {
        validationResult: this._validationResult,
        validationErrors: errors
      });

      return this._validationResult;
    }

    save() {
      var validationResult = this.validate();

      if (validationResult !== "true") {
        this._savePayload = [];
        this._lastEvent = JSON.stringify({
          type: "save",
          status: "VALIDATION_FAILED",
          validationResult: this._validationResult,
          errorCount: this._validationErrors.length
        });
        this._widgetStatus = "ERROR";
        this._syncRows();
        this._fireSimpleEvent("onDataChange", {
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
          rowIndex: 1,
          field: "selected",
          message: "Please select at least one row to save"
        }];
        this._validationResult = "false";
        this._widgetStatus = "ERROR";
        this._lastEvent = JSON.stringify({
          type: "save",
          status: "NO_SELECTION",
          payloadCount: 0
        });
        this._syncRows();
        this._refreshTable();
        this._fireSimpleEvent("onDataChange", {
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
        status: "READY",
        payloadCount: payload.length
      });
      this._widgetStatus = "SAVE_READY";
      this._syncRows();
      this._fireSimpleEvent("onDataChange", {
        rows: this._rows,
        savePayload: payload
      });
    }

    getRows() {
      return JSON.stringify(this._rows || []);
    }

    setRows(rowsJson) {
      try {
        this._rows = JSON.parse(rowsJson || "[]");
        if (!Array.isArray(this._rows) || this._rows.length === 0) {
          this._rows = [this._createEmptyRow()];
        }
      } catch (e) {
        this._rows = [this._createEmptyRow()];
      }

      this._normalizeAllRows();
      this._widgetStatus = "LOADED";
      this._syncRows();
      this._refreshTable();
    }

    getRowCount() {
      return this._rows.length;
    }

    getSelectedRowCount() {
      var count = 0;
      for (var i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected === true) {
          count++;
        }
      }
      return count;
    }

    getRowValue(rowIndex, fieldName) {
      if (rowIndex < 0 || rowIndex >= this._rows.length) {
        return "";
      }
      var row = this._rows[rowIndex];
      if (!row || row[fieldName] === undefined || row[fieldName] === null) {
        return "";
      }
      return String(row[fieldName]);
    }

    getSelectedRowValue(selectedIndex, fieldName) {
      var selectedRows = [];

      for (var i = 0; i < this._rows.length; i++) {
        if (this._rows[i].selected === true) {
          selectedRows.push(this._rows[i]);
        }
      }

      if (selectedIndex < 0 || selectedIndex >= selectedRows.length) {
        return "";
      }

      var row = selectedRows[selectedIndex];
      if (!row || row[fieldName] === undefined || row[fieldName] === null) {
        return "";
      }

      return String(row[fieldName]);
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

    setGlAccountOptions(json) {
      this._glAccountOptions = this._parseOptions(json);
      this._refreshTable();
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
  "use strict";

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML = `
    <style>
      :host {
        display: block;
        font-family: "72", Arial, Helvetica, sans-serif;
        color: #1f2937;
        --mw-border: #d9dfe8;
        --mw-border-strong: #c8d0db;
        --mw-text: #1f2937;
        --mw-subtext: #6b7280;
        --mw-bg: #ffffff;
        --mw-bg-soft: #f7f9fb;
        --mw-bg-hover: #eef3f8;
        --mw-header-bg: #f3f6f9;
        --mw-accent: #0a6ed1;
        --mw-accent-soft: rgba(10, 110, 209, 0.12);
        --mw-success: #107e3e;
        --mw-warning: #b26a00;
        --mw-error: #bb0000;
        --mw-shadow: 0 8px 28px rgba(31, 41, 55, 0.18);
        --mw-radius: 10px;
      }

      * {
        box-sizing: border-box;
      }

      .mw-shell {
        border: 1px solid var(--mw-border);
        border-radius: 12px;
        background: var(--mw-bg);
        overflow: hidden;
      }

      .mw-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        background: linear-gradient(180deg, #fbfcfe 0%, #f5f8fb 100%);
        border-bottom: 1px solid var(--mw-border);
      }

      .mw-toolbar-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .mw-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--mw-text);
      }

      .mw-subtitle {
        font-size: 12px;
        color: var(--mw-subtext);
      }

      .mw-toolbar-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .mw-btn {
        appearance: none;
        border: 1px solid var(--mw-border-strong);
        background: #ffffff;
        color: var(--mw-text);
        border-radius: 8px;
        min-height: 34px;
        padding: 0 12px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .mw-btn:hover {
        background: var(--mw-bg-hover);
      }

      .mw-btn:active {
        transform: translateY(1px);
      }

      .mw-btn.primary {
        background: var(--mw-accent);
        border-color: var(--mw-accent);
        color: #ffffff;
      }

      .mw-btn.primary:hover {
        filter: brightness(0.97);
      }

      .mw-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        border: 1px solid transparent;
      }

      .mw-status.ready {
        color: #0b5cad;
        background: rgba(10, 110, 209, 0.08);
        border-color: rgba(10, 110, 209, 0.16);
      }

      .mw-status.changed {
        color: #8a5300;
        background: rgba(178, 106, 0, 0.1);
        border-color: rgba(178, 106, 0, 0.16);
      }

      .mw-status.error {
        color: #a70000;
        background: rgba(187, 0, 0, 0.08);
        border-color: rgba(187, 0, 0, 0.16);
      }

      .mw-table-wrap {
        width: 100%;
        overflow: auto;
        background: #ffffff;
      }

      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        min-width: 1280px;
      }

      thead th {
        position: sticky;
        top: 0;
        z-index: 2;
        background: var(--mw-header-bg);
        color: #334155;
        font-size: 12px;
        font-weight: 700;
        text-transform: none;
        letter-spacing: 0.01em;
        border-bottom: 1px solid var(--mw-border);
        padding: 10px 10px;
        text-align: left;
        white-space: nowrap;
      }

      tbody td {
        border-bottom: 1px solid #edf1f5;
        padding: 8px 10px;
        vertical-align: middle;
        background: #ffffff;
      }

      tbody tr:hover td {
        background: #fbfdff;
      }

      tbody tr.is-selected td {
        background: #f7fbff;
      }

      tbody tr.row-error td {
        background: rgba(187, 0, 0, 0.03);
      }

      .mw-col-select {
        width: 54px;
        min-width: 54px;
        text-align: center;
      }

      .mw-col-gl,
      .mw-col-cc,
      .mw-col-pc,
      .mw-col-seg,
      .mw-col-id,
      .mw-col-sub,
      .mw-col-map,
      .mw-col-hier {
        min-width: 160px;
      }

      .mw-col-id {
        min-width: 220px;
      }

      .mw-checkbox {
        width: 16px;
        height: 16px;
        cursor: pointer;
      }

      .mw-input,
      .mw-readonly,
      .mw-dropdown-trigger {
        width: 100%;
        min-height: 34px;
        border: 1px solid var(--mw-border-strong);
        border-radius: 8px;
        padding: 7px 10px;
        font-size: 13px;
        color: var(--mw-text);
        background: #ffffff;
        outline: none;
        transition: all 0.18s ease;
      }

      .mw-readonly {
        background: #f8fafc;
        color: #475569;
      }

      .mw-input:focus,
      .mw-dropdown-trigger:focus {
        border-color: var(--mw-accent);
        box-shadow: 0 0 0 3px var(--mw-accent-soft);
      }

      .mw-field-wrap {
        position: relative;
      }

      .mw-dropdown-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }

      .mw-dropdown-trigger.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: #f8fafc;
      }

      .mw-dropdown-trigger-text {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .mw-dropdown-caret {
        flex: 0 0 auto;
        color: #64748b;
        font-size: 12px;
      }

      .mw-cell-error .mw-input,
      .mw-cell-error .mw-dropdown-trigger,
      .mw-cell-error .mw-readonly {
        border-color: var(--mw-error);
        box-shadow: 0 0 0 2px rgba(187, 0, 0, 0.08);
      }

      .mw-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border-top: 1px solid var(--mw-border);
        background: #fbfcfe;
      }

      .mw-footer-left,
      .mw-footer-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .mw-message {
        min-height: 18px;
        font-size: 12px;
        color: var(--mw-subtext);
      }

      .mw-message.error {
        color: var(--mw-error);
        font-weight: 600;
      }

      .mw-message.success {
        color: var(--mw-success);
        font-weight: 600;
      }

      .mw-message.warning {
        color: var(--mw-warning);
        font-weight: 600;
      }

      .mw-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 26px;
        border-radius: 999px;
        padding: 0 10px;
        background: #eef3f8;
        color: #425466;
        font-size: 12px;
        font-weight: 700;
      }

      .mw-overlay {
        position: fixed;
        inset: 0;
        background: transparent;
        z-index: 2147483000;
        display: none;
      }

      .mw-overlay.open {
        display: block;
      }

      .mw-dropdown-panel {
        position: fixed;
        z-index: 2147483001;
        width: 360px;
        max-width: calc(100vw - 24px);
        max-height: 360px;
        background: #ffffff;
        border: 1px solid var(--mw-border-strong);
        border-radius: 12px;
        box-shadow: var(--mw-shadow);
        overflow: hidden;
        display: none;
      }

      .mw-dropdown-panel.open {
        display: block;
      }

      .mw-dropdown-panel-header {
        padding: 10px;
        border-bottom: 1px solid #edf1f5;
        background: #fbfcfe;
      }

      .mw-dropdown-search {
        width: 100%;
        min-height: 34px;
        border: 1px solid var(--mw-border-strong);
        border-radius: 8px;
        padding: 7px 10px;
        font-size: 13px;
        outline: none;
      }

      .mw-dropdown-search:focus {
        border-color: var(--mw-accent);
        box-shadow: 0 0 0 3px var(--mw-accent-soft);
      }

      .mw-dropdown-list {
        max-height: 300px;
        overflow: auto;
        padding: 6px;
      }

      .mw-option {
        display: flex;
        align-items: center;
        width: 100%;
        min-height: 34px;
        padding: 8px 10px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        color: var(--mw-text);
        line-height: 1.35;
        white-space: normal;
        word-break: break-word;
      }

      .mw-option:hover,
      .mw-option.active {
        background: var(--mw-bg-hover);
      }

      .mw-option.empty {
        color: var(--mw-subtext);
        font-style: italic;
      }

      .mw-hidden {
        display: none !important;
      }
    </style>

    <div class="mw-shell">
      <div class="mw-toolbar">
        <div class="mw-toolbar-left">
          <div class="mw-title">Project Entry Widget</div>
          <div class="mw-subtitle">Management Mapping</div>
        </div>
        <div class="mw-toolbar-right">
          <div class="mw-status ready" id="statusBadge">READY</div>
          <button class="mw-btn" id="addRowBtn" type="button">Add Row</button>
          <button class="mw-btn" id="deleteRowBtn" type="button">Delete Selected</button>
          <button class="mw-btn" id="clearBtn" type="button">Clear</button>
          <button class="mw-btn primary" id="saveBtn" type="button">Save</button>
        </div>
      </div>

      <div class="mw-table-wrap">
        <table>
          <thead>
            <tr>
              <th class="mw-col-select">Sel</th>
              <th class="mw-col-gl">GLACCOUNT</th>
              <th class="mw-col-cc">COSTCENTER</th>
              <th class="mw-col-pc">PROFITCENTER</th>
              <th class="mw-col-seg">SEGMENT</th>
              <th class="mw-col-id">ID</th>
              <th class="mw-col-sub">MANAGEMENT SUB-MAPPING</th>
              <th class="mw-col-map">MANAGEMENT MAPPING</th>
              <th class="mw-col-hier">Hierarchy</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>

      <div class="mw-footer">
        <div class="mw-footer-left">
          <div class="mw-message" id="messageArea"></div>
        </div>
        <div class="mw-footer-right">
          <div class="mw-badge" id="rowCountBadge">Rows: 0</div>
          <div class="mw-badge" id="selectedCountBadge">Selected: 0</div>
        </div>
      </div>
    </div>

    <div class="mw-overlay" id="dropdownOverlay"></div>
    <div class="mw-dropdown-panel" id="dropdownPanel">
      <div class="mw-dropdown-panel-header">
        <input id="dropdownSearch" class="mw-dropdown-search" type="text" placeholder="Search..." />
      </div>
      <div class="mw-dropdown-list" id="dropdownList"></div>
    </div>
  `;

  function ProjectEntryWidget() {
    HTMLElement.call(this);

    this._shadow = this.attachShadow({ mode: "open" });
    this._shadow.appendChild(TEMPLATE.content.cloneNode(true));

    this._rows = [];
    this._rowCounter = 0;

    this._glAccountOptions = [];
    this._costCenterOptions = [];
    this._profitCenterOptions = [];
    this._segmentOptions = [];
    this._hierarchyOptions = [];
    this._managementMappingOptions = [];
    this._managementSubMappingOptions = [];

    this._rowOptions = {};

    this._visible = true;
    this._widgetStatus = "READY";
    this._validationState = { isValid: true, message: "" };
    this._lastEvent = "";

    this._dropdownState = {
      open: false,
      rowIndex: -1,
      fieldName: "",
      anchor: null,
      options: [],
      filteredOptions: [],
      searchText: "",
      activeIndex: -1
    };

    this._els = {
      tableBody: this._shadow.getElementById("tableBody"),
      messageArea: this._shadow.getElementById("messageArea"),
      rowCountBadge: this._shadow.getElementById("rowCountBadge"),
      selectedCountBadge: this._shadow.getElementById("selectedCountBadge"),
      statusBadge: this._shadow.getElementById("statusBadge"),
      addRowBtn: this._shadow.getElementById("addRowBtn"),
      deleteRowBtn: this._shadow.getElementById("deleteRowBtn"),
      clearBtn: this._shadow.getElementById("clearBtn"),
      saveBtn: this._shadow.getElementById("saveBtn"),
      dropdownOverlay: this._shadow.getElementById("dropdownOverlay"),
      dropdownPanel: this._shadow.getElementById("dropdownPanel"),
      dropdownSearch: this._shadow.getElementById("dropdownSearch"),
      dropdownList: this._shadow.getElementById("dropdownList")
    };

    this._bindEvents();
    this._ensureMinimumRow();
    this._refreshTable();
    this._syncRows();
  }

  ProjectEntryWidget.prototype = Object.create(HTMLElement.prototype);
  ProjectEntryWidget.prototype.constructor = ProjectEntryWidget;

  ProjectEntryWidget.prototype._bindEvents = function () {
    var that = this;

    this._els.addRowBtn.addEventListener("click", function () {
      that.addRow();
    });

    this._els.deleteRowBtn.addEventListener("click", function () {
      that.deleteSelectedRows();
    });

    this._els.clearBtn.addEventListener("click", function () {
      that.clear();
    });

    this._els.saveBtn.addEventListener("click", function () {
      that.save();
    });

    this._els.dropdownOverlay.addEventListener("mousedown", function () {
      that._closeDropdown();
    });

    this._els.dropdownSearch.addEventListener("input", function () {
      that._dropdownState.searchText = that._safeString(that._els.dropdownSearch.value);
      that._renderDropdownOptions();
    });

    this._els.dropdownSearch.addEventListener("keydown", function (e) {
      if (!that._dropdownState.open) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        that._closeDropdown();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        that._moveDropdownActive(1);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        that._moveDropdownActive(-1);
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        that._selectActiveDropdownOption();
      }
    });

    window.addEventListener("resize", function () {
      if (that._dropdownState.open) {
        that._positionDropdown();
      }
    });

    window.addEventListener("scroll", function () {
      if (that._dropdownState.open) {
        that._positionDropdown();
      }
    }, true);
  };

  ProjectEntryWidget.prototype.connectedCallback = function () {
    this._fireSimpleEvent("onReady", { status: "READY" });
  };

  ProjectEntryWidget.prototype._ensureMinimumRow = function () {
    if (this._rows.length === 0) {
      this._rows.push(this._createEmptyRow());
    }
  };

  ProjectEntryWidget.prototype._createEmptyRow = function () {
    var row = {
      _rowId: "row_" + (++this._rowCounter),
      selected: false,
      GLACCOUNT: "",
      COSTCENTER: "",
      PROFITCENTER: "",
      SEGMENT: "",
      ID: "",
      MANAGEMENT_SUB_MAPPING: "",
      MANAGEMENT_MAPPING: "",
      Hierarchy: "",
      rowStatus: "NEW",
      isModified: false,
      errors: {},
      _rowOptions: {}
    };

    this._initializeRowOptions(row);
    return row;
  };

  ProjectEntryWidget.prototype._initializeRowOptions = function (row) {
    row._rowOptions = {
      GLACCOUNT: this._cloneOptions(this._glAccountOptions),
      COSTCENTER: this._cloneOptions(this._costCenterOptions),
      PROFITCENTER: this._cloneOptions(this._profitCenterOptions),
      SEGMENT: this._cloneOptions(this._segmentOptions),
      Hierarchy: this._cloneOptions(this._hierarchyOptions),
      MANAGEMENT_MAPPING: this._cloneOptions(this._managementMappingOptions),
      MANAGEMENT_SUB_MAPPING: this._cloneOptions(this._managementSubMappingOptions)
    };
  };

  ProjectEntryWidget.prototype._resetRowOptionsFromMaster = function (row, fieldName) {
    if (!row || !row._rowOptions) {
      return;
    }

    if (fieldName === "GLACCOUNT") {
      row._rowOptions.GLACCOUNT = this._cloneOptions(this._glAccountOptions);
    } else if (fieldName === "COSTCENTER") {
      row._rowOptions.COSTCENTER = this._cloneOptions(this._costCenterOptions);
    } else if (fieldName === "PROFITCENTER") {
      row._rowOptions.PROFITCENTER = this._cloneOptions(this._profitCenterOptions);
    } else if (fieldName === "SEGMENT") {
      row._rowOptions.SEGMENT = this._cloneOptions(this._segmentOptions);
    } else if (fieldName === "Hierarchy") {
      row._rowOptions.Hierarchy = this._cloneOptions(this._hierarchyOptions);
    } else if (fieldName === "MANAGEMENT_MAPPING") {
      row._rowOptions.MANAGEMENT_MAPPING = this._cloneOptions(this._managementMappingOptions);
    } else if (fieldName === "MANAGEMENT_SUB_MAPPING") {
      row._rowOptions.MANAGEMENT_SUB_MAPPING = this._cloneOptions(this._managementSubMappingOptions);
    }
  };

  ProjectEntryWidget.prototype._getRowOptionsForField = function (row, fieldName) {
    if (!row || !row._rowOptions) {
      return [];
    }

    if (row._rowOptions[fieldName]) {
      return row._rowOptions[fieldName];
    }

    return [];
  };

  ProjectEntryWidget.prototype._setRowOptionsForField = function (row, fieldName, options) {
    if (!row) {
      return;
    }

    if (!row._rowOptions) {
      row._rowOptions = {};
    }

    row._rowOptions[fieldName] = this._cloneOptions(options);
  };

  ProjectEntryWidget.prototype._cloneOptions = function (options) {
    var source = Array.isArray(options) ? options : [];
    var out = [];
    var i;
    var item;

    for (i = 0; i < source.length; i++) {
      item = source[i] || {};
      out.push({
        id: this._safeString(item.id),
        description: this._safeString(item.description)
      });
    }

    return out;
  };

  ProjectEntryWidget.prototype._safeString = function (value) {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value);
  };

  ProjectEntryWidget.prototype._parseOptions = function (json) {
    var raw = json;
    var i;
    var item;
    var out = [];

    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch (e) {
        raw = [];
      }
    }

    if (!Array.isArray(raw)) {
      raw = [];
    }

    for (i = 0; i < raw.length; i++) {
      item = raw[i] || {};
      out.push({
        id: this._safeString(item.id),
        description: this._safeString(item.description || item.text || item.id)
      });
    }

    return out;
  };

  ProjectEntryWidget.prototype._getOptionTextForRow = function (row, fieldName, value) {
    var currentValue = this._safeString(value);
    var options = this._getRowOptionsForField(row, fieldName);
    var i;
    var item;

    if (currentValue === "") {
      return "";
    }

    for (i = 0; i < options.length; i++) {
      item = options[i];
      if (this._safeString(item.id) === currentValue) {
        return this._safeString(item.description || item.id);
      }
    }

    return currentValue;
  };

  ProjectEntryWidget.prototype._cleanupRowInvalidSelections = function (row) {
    if (!row) {
      return;
    }

    this._cleanupSingleFieldSelection(row, "GLACCOUNT");
    this._cleanupSingleFieldSelection(row, "COSTCENTER");
    this._cleanupSingleFieldSelection(row, "PROFITCENTER");
    this._cleanupSingleFieldSelection(row, "SEGMENT");
    this._cleanupSingleFieldSelection(row, "Hierarchy");
    this._cleanupSingleFieldSelection(row, "MANAGEMENT_MAPPING");
    this._cleanupSingleFieldSelection(row, "MANAGEMENT_SUB_MAPPING");
  };

  ProjectEntryWidget.prototype._cleanupSingleFieldSelection = function (row, fieldName) {
    var value = this._safeString(row[fieldName]);
    var options = this._getRowOptionsForField(row, fieldName);
    var exists = false;
    var i;

    if (value === "") {
      return;
    }

    for (i = 0; i < options.length; i++) {
      if (this._safeString(options[i].id) === value) {
        exists = true;
        break;
      }
    }

    if (!exists) {
      row[fieldName] = "";
    }
  };

  ProjectEntryWidget.prototype._renderFieldCell = function (row, rowIndex, fieldName, readOnly) {
    var fieldWrap = document.createElement("div");
    fieldWrap.className = "mw-field-wrap";

    if (row.errors && row.errors[fieldName]) {
      fieldWrap.className += " mw-cell-error";
    }

    if (readOnly) {
      var readonly = document.createElement("div");
      readonly.className = "mw-readonly";
      readonly.textContent = this._safeString(row[fieldName]);
      fieldWrap.appendChild(readonly);
      return fieldWrap;
    }

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "mw-dropdown-trigger";
    trigger.setAttribute("data-row-index", String(rowIndex));
    trigger.setAttribute("data-field-name", fieldName);

    var text = document.createElement("span");
    text.className = "mw-dropdown-trigger-text";
    text.textContent = this._getOptionTextForRow(row, fieldName, row[fieldName]) || "Select";

    var caret = document.createElement("span");
    caret.className = "mw-dropdown-caret";
    caret.textContent = "▼";

    trigger.appendChild(text);
    trigger.appendChild(caret);

    var that = this;
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      that._openDropdown(rowIndex, fieldName, trigger);
    });

    fieldWrap.appendChild(trigger);
    return fieldWrap;
  };

  ProjectEntryWidget.prototype._refreshTable = function () {
    var tbody = this._els.tableBody;
    var i;
    var row;
    var tr;
    var td;
    var checkbox;
    var that = this;

    tbody.innerHTML = "";

    for (i = 0; i < this._rows.length; i++) {
      row = this._rows[i];
      tr = document.createElement("tr");

      if (row.selected) {
        tr.className = "is-selected";
      }

      if (row.errors && Object.keys(row.errors).length > 0) {
        tr.className += (tr.className ? " " : "") + "row-error";
      }

      td = document.createElement("td");
      td.className = "mw-col-select";
      checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "mw-checkbox";
      checkbox.checked = row.selected === true;
      checkbox.setAttribute("data-row-index", String(i));
      checkbox.addEventListener("change", function (e) {
        var rowIndex = parseInt(e.target.getAttribute("data-row-index"), 10);
        that._toggleRowSelection(rowIndex, e.target.checked);
      });
      td.appendChild(checkbox);
      tr.appendChild(td);

      td = document.createElement("td");
      td.className = "mw-col-gl";
      td.appendChild(this._renderFieldCell(row, i, "GLACCOUNT", false));
      tr.appendChild(td);

      td = document.createElement("td");
      td.className = "mw-col-cc";
      td.appendChild(this._renderFieldCell(row, i, "COSTCENTER", false));
      tr.appendChild(td);

      td = document.createElement("td");
      td.className = "mw-col-pc";
      td.appendChild(this._renderFieldCell(row, i, "PROFITCENTER", false));
      tr.appendChild(td);

      td = document.createElement("td");
      td.className = "mw-col-seg";
      td.appendChild(this._renderFieldCell(row, i, "SEGMENT", false));
      tr.appendChild(td);

      td = document.createElement("td");
      td.className = "mw-col-id";
      td.appendChild(this._renderFieldCell(row, i, "ID", true));
      tr.appendChild(td);

      td = document.createElement("td");
      td.className = "mw-col-sub";
      td.appendChild(this._renderFieldCell(row, i, "MANAGEMENT_SUB_MAPPING", false));
      tr.appendChild(td);

      td = document.createElement("td");
      td.className = "mw-col-map";
      td.appendChild(this._renderFieldCell(row, i, "MANAGEMENT_MAPPING", false));
      tr.appendChild(td);

      td = document.createElement("td");
      td.className = "mw-col-hier";
      td.appendChild(this._renderFieldCell(row, i, "Hierarchy", false));
      tr.appendChild(td);

      tbody.appendChild(tr);
    }

    this._updateFooter();
    this._updateStatusBadge();
  };

  ProjectEntryWidget.prototype._updateFooter = function () {
    var selectedCount = 0;
    var i;

    for (i = 0; i < this._rows.length; i++) {
      if (this._rows[i].selected) {
        selectedCount++;
      }
    }

    this._els.rowCountBadge.textContent = "Rows: " + this._rows.length;
    this._els.selectedCountBadge.textContent = "Selected: " + selectedCount;
  };

  ProjectEntryWidget.prototype._updateStatusBadge = function () {
    var badge = this._els.statusBadge;
    var status = this._widgetStatus || "READY";

    badge.className = "mw-status";
    if (status === "ERROR") {
      badge.className += " error";
    } else if (status === "CHANGED") {
      badge.className += " changed";
    } else {
      badge.className += " ready";
    }

    badge.textContent = status;
  };

  ProjectEntryWidget.prototype._setMessage = function (text, type) {
    var el = this._els.messageArea;
    el.className = "mw-message";
    if (type) {
      el.className += " " + type;
    }
    el.textContent = this._safeString(text);
  };

  ProjectEntryWidget.prototype._toggleRowSelection = function (rowIndex, checked) {
    if (rowIndex < 0 || rowIndex >= this._rows.length) {
      return;
    }

    this._rows[rowIndex].selected = checked === true;
    this._rows[rowIndex].isModified = true;
    this._widgetStatus = "CHANGED";
    this._lastEvent = JSON.stringify({
      type: "selection",
      row: rowIndex,
      selected: checked === true
    });

    this._syncRows();
    this._refreshTable();
    this._fireSimpleEvent("onDataChange", { rows: this._rows });
  };

  ProjectEntryWidget.prototype._openDropdown = function (rowIndex, fieldName, anchorEl) {
    if (rowIndex < 0 || rowIndex >= this._rows.length) {
      return;
    }

    var row = this._rows[rowIndex];
    var options = this._getRowOptionsForField(row, fieldName);

    this._dropdownState.open = true;
    this._dropdownState.rowIndex = rowIndex;
    this._dropdownState.fieldName = fieldName;
    this._dropdownState.anchor = anchorEl;
    this._dropdownState.options = this._cloneOptions(options);
    this._dropdownState.filteredOptions = this._cloneOptions(options);
    this._dropdownState.searchText = "";
    this._dropdownState.activeIndex = -1;

    this._els.dropdownSearch.value = "";
    this._els.dropdownOverlay.classList.add("open");
    this._els.dropdownPanel.classList.add("open");

    this._positionDropdown();
    this._renderDropdownOptions();
    this._els.dropdownSearch.focus();
  };

  ProjectEntryWidget.prototype._positionDropdown = function () {
    if (!this._dropdownState.open || !this._dropdownState.anchor) {
      return;
    }

    var rect = this._dropdownState.anchor.getBoundingClientRect();
    var panel = this._els.dropdownPanel;
    var top = rect.bottom + 6;
    var left = rect.left;
    var width = Math.max(rect.width, 320);
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;

    if (left + width > viewportWidth - 12) {
      left = viewportWidth - width - 12;
    }

    if (left < 12) {
      left = 12;
    }

    panel.style.width = width + "px";

    panel.style.left = left + "px";
    if (top + 360 > viewportHeight - 12) {
      top = Math.max(12, rect.top - 366);
    }
    panel.style.top = top + "px";
  };

  ProjectEntryWidget.prototype._renderDropdownOptions = function () {
    var list = this._els.dropdownList;
    var all = this._cloneOptions(this._dropdownState.options);
    var search = this._safeString(this._dropdownState.searchText).toLowerCase();
    var filtered = [];
    var i;
    var text;
    var optionEl;
    var that = this;

    list.innerHTML = "";

    for (i = 0; i < all.length; i++) {
      text = (this._safeString(all[i].id) + " " + this._safeString(all[i].description)).toLowerCase();
      if (search === "" || text.indexOf(search) !== -1) {
        filtered.push(all[i]);
      }
    }

    this._dropdownState.filteredOptions = filtered;

    if (filtered.length === 0) {
      optionEl = document.createElement("div");
      optionEl.className = "mw-option empty";
      optionEl.textContent = "No options found";
      list.appendChild(optionEl);
      return;
    }

    for (i = 0; i < filtered.length; i++) {
      (function (index) {
        var item = filtered[index];
        var itemEl = document.createElement("div");
        itemEl.className = "mw-option";
        itemEl.setAttribute("data-option-index", String(index));
        itemEl.textContent = that._safeString(item.description || item.id);

        itemEl.addEventListener("mousedown", function (e) {
          e.preventDefault();
          that._applyDropdownSelection(index);
        });

        list.appendChild(itemEl);
      })(i);
    }
  };

  ProjectEntryWidget.prototype._moveDropdownActive = function (delta) {
    var options = this._dropdownState.filteredOptions || [];
    var list = this._els.dropdownList;
    var items = list.querySelectorAll(".mw-option:not(.empty)");
    var nextIndex;

    if (options.length === 0) {
      return;
    }

    nextIndex = this._dropdownState.activeIndex + delta;
    if (nextIndex < 0) {
      nextIndex = options.length - 1;
    }
    if (nextIndex >= options.length) {
      nextIndex = 0;
    }

    this._dropdownState.activeIndex = nextIndex;

    Array.prototype.forEach.call(items, function (el) {
      el.classList.remove("active");
    });

    if (items[nextIndex]) {
      items[nextIndex].classList.add("active");
      if (typeof items[nextIndex].scrollIntoView === "function") {
        items[nextIndex].scrollIntoView({ block: "nearest" });
      }
    }
  };

  ProjectEntryWidget.prototype._selectActiveDropdownOption = function () {
    if (this._dropdownState.activeIndex < 0) {
      if ((this._dropdownState.filteredOptions || []).length > 0) {
        this._applyDropdownSelection(0);
      }
      return;
    }
    this._applyDropdownSelection(this._dropdownState.activeIndex);
  };

  ProjectEntryWidget.prototype._applyDropdownSelection = function (optionIndex) {
    var filtered = this._dropdownState.filteredOptions || [];
    var item = filtered[optionIndex];
    var rowIndex = this._dropdownState.rowIndex;
    var fieldName = this._dropdownState.fieldName;

    if (!item) {
      return;
    }

    this._closeDropdown();
    this._setRowFieldValue(rowIndex, fieldName, this._safeString(item.id), true);
  };

  ProjectEntryWidget.prototype._closeDropdown = function () {
    this._dropdownState.open = false;
    this._dropdownState.rowIndex = -1;
    this._dropdownState.fieldName = "";
    this._dropdownState.anchor = null;
    this._dropdownState.options = [];
    this._dropdownState.filteredOptions = [];
    this._dropdownState.searchText = "";
    this._dropdownState.activeIndex = -1;

    this._els.dropdownOverlay.classList.remove("open");
    this._els.dropdownPanel.classList.remove("open");
  };

  ProjectEntryWidget.prototype._setRowFieldValue = function (rowIndex, fieldName, value, fireEvents) {
    if (rowIndex < 0 || rowIndex >= this._rows.length) {
      return;
    }

    var row = this._rows[rowIndex];
    var newValue = this._safeString(value);
    var oldValue = this._safeString(row[fieldName]);

    if (oldValue === newValue) {
      return;
    }

    row[fieldName] = newValue;

    if (fieldName !== "ID") {
      row.ID = this._buildId(row);
    }

    row.isModified = true;
    row.rowStatus = row.rowStatus === "NEW" ? "NEW" : "CHANGED";

    if (row.errors && row.errors[fieldName]) {
      delete row.errors[fieldName];
    }

    if (row.errors && row.errors.ID && fieldName !== "ID") {
      delete row.errors.ID;
    }

    this._widgetStatus = "CHANGED";
    this._validationState = { isValid: true, message: "" };

    this._lastEvent = JSON.stringify({
      type: "fieldChange",
      row: rowIndex,
      field: fieldName,
      value: newValue
    });

    this._syncRows();
    this._refreshTable();

    if (fireEvents) {
      this._fireSimpleEvent("onFieldChange", {
        row: rowIndex,
        field: fieldName,
        value: newValue
      });
      this._fireSimpleEvent("onDataChange", { rows: this._rows });
    }
  };

  ProjectEntryWidget.prototype._buildId = function (row) {
    var parts = [];
    if (this._safeString(row.GLACCOUNT) !== "") {
      parts.push(this._safeString(row.GLACCOUNT));
    }
    if (this._safeString(row.COSTCENTER) !== "") {
      parts.push(this._safeString(row.COSTCENTER));
    }
    if (this._safeString(row.PROFITCENTER) !== "") {
      parts.push(this._safeString(row.PROFITCENTER));
    }
    if (this._safeString(row.SEGMENT) !== "") {
      parts.push(this._safeString(row.SEGMENT));
    }
    return parts.join("_");
  };

  ProjectEntryWidget.prototype._syncRows = function () {
    this.value = JSON.stringify(this._serializeRows());
  };

  ProjectEntryWidget.prototype._serializeRows = function () {
    var out = [];
    var i;
    var row;

    for (i = 0; i < this._rows.length; i++) {
      row = this._rows[i];
      out.push({
        selected: row.selected === true,
        GLACCOUNT: this._safeString(row.GLACCOUNT),
        COSTCENTER: this._safeString(row.COSTCENTER),
        PROFITCENTER: this._safeString(row.PROFITCENTER),
        SEGMENT: this._safeString(row.SEGMENT),
        ID: this._safeString(row.ID),
        MANAGEMENT_SUB_MAPPING: this._safeString(row.MANAGEMENT_SUB_MAPPING),
        MANAGEMENT_MAPPING: this._safeString(row.MANAGEMENT_MAPPING),
        Hierarchy: this._safeString(row.Hierarchy),
        rowStatus: this._safeString(row.rowStatus),
        isModified: row.isModified === true
      });
    }

    return out;
  };

  ProjectEntryWidget.prototype._fireSimpleEvent = function (name, detail) {
    this.dispatchEvent(new CustomEvent(name, {
      detail: detail || {},
      bubbles: true,
      composed: true
    }));
  };

  ProjectEntryWidget.prototype.addRow = function () {
    this._rows.push(this._createEmptyRow());
    this._widgetStatus = "CHANGED";
    this._lastEvent = JSON.stringify({
      type: "addRow",
      rowCount: this._rows.length
    });
    this._setMessage("", "");
    this._syncRows();
    this._refreshTable();
    this._fireSimpleEvent("onDataChange", { rows: this._rows });
  };

  ProjectEntryWidget.prototype.deleteSelectedRows = function () {
    var kept = [];
    var deletedCount = 0;
    var i;

    for (i = 0; i < this._rows.length; i++) {
      if (this._rows[i].selected) {
        deletedCount++;
      } else {
        kept.push(this._rows[i]);
      }
    }

    if (deletedCount === 0) {
      this._setMessage("Please select at least one row to delete", "warning");
      this._lastEvent = JSON.stringify({
        type: "deleteRows",
        status: "NO_SELECTION"
      });
      this._fireSimpleEvent("onValidate", {
        isValid: false,
        message: "Please select at least one row to delete"
      });
      return;
    }

    this._rows = kept;
    this._ensureMinimumRow();
    this._widgetStatus = "CHANGED";
    this._lastEvent = JSON.stringify({
      type: "deleteRows",
      status: "SUCCESS",
      deletedCount: deletedCount
    });
    this._setMessage(deletedCount + " row(s) deleted", "success");
    this._syncRows();
    this._refreshTable();
    this._fireSimpleEvent("onDataChange", { rows: this._rows });
  };

  ProjectEntryWidget.prototype.clear = function () {
    this._closeDropdown();
    this._rows = [this._createEmptyRow()];
    this._widgetStatus = "READY";
    this._validationState = { isValid: true, message: "" };
    this._lastEvent = JSON.stringify({
      type: "clear",
      status: "SUCCESS"
    });
    this._setMessage("Widget cleared", "success");
    this._syncRows();
    this._refreshTable();
    this._fireSimpleEvent("onDataChange", { rows: this._rows });
  };

  ProjectEntryWidget.prototype._validateRows = function () {
    var i;
    var row;
    var isValid = true;
    var msg = "";

    for (i = 0; i < this._rows.length; i++) {
      row = this._rows[i];
      row.errors = {};

      if (row.selected) {
        if (this._safeString(row.GLACCOUNT) === "") {
          row.errors.GLACCOUNT = "Required";
          isValid = false;
        }
        if (this._safeString(row.COSTCENTER) === "") {
          row.errors.COSTCENTER = "Required";
          isValid = false;
        }
        if (this._safeString(row.PROFITCENTER) === "") {
          row.errors.PROFITCENTER = "Required";
          isValid = false;
        }
        if (this._safeString(row.SEGMENT) === "") {
          row.errors.SEGMENT = "Required";
          isValid = false;
        }
        if (this._safeString(row.ID) === "") {
          row.errors.ID = "Required";
          isValid = false;
        }
        if (this._safeString(row.MANAGEMENT_SUB_MAPPING) === "") {
          row.errors.MANAGEMENT_SUB_MAPPING = "Required";
          isValid = false;
        }
        if (this._safeString(row.MANAGEMENT_MAPPING) === "") {
          row.errors.MANAGEMENT_MAPPING = "Required";
          isValid = false;
        }
        if (this._safeString(row.Hierarchy) === "") {
          row.errors.Hierarchy = "Required";
          isValid = false;
        }
      }
    }

    if (!isValid) {
      msg = "Please complete all required fields in selected rows";
    }

    this._validationState = {
      isValid: isValid,
      message: msg
    };

    return this._validationState;
  };

  ProjectEntryWidget.prototype.validate = function () {
    var result = this._validateRows();

    if (result.isValid) {
      this._setMessage("Validation successful", "success");
      if (this._widgetStatus !== "CHANGED") {
        this._widgetStatus = "READY";
      }
    } else {
      this._setMessage(result.message, "error");
      this._widgetStatus = "ERROR";
    }

    this._lastEvent = JSON.stringify({
      type: "validate",
      isValid: result.isValid,
      message: result.message
    });

    this._refreshTable();
    this._fireSimpleEvent("onValidate", result);
    return JSON.stringify(result);
  };

  ProjectEntryWidget.prototype.save = function () {
    var validationResult = this._validateRows();
    var payload = [];
    var i;
    var row;

    if (!validationResult.isValid) {
      this._widgetStatus = "ERROR";
      this._setMessage(validationResult.message, "error");
      this._lastEvent = JSON.stringify({
        type: "save",
        status: "VALIDATION_ERROR",
        message: validationResult.message
      });
      this._refreshTable();
      this._fireSimpleEvent("onValidate", validationResult);
      return;
    }

    for (i = 0; i < this._rows.length; i++) {
      row = this._rows[i];
      if (row.selected === true) {
        payload.push({
          GLACCOUNT: this._safeString(row.GLACCOUNT),
          COSTCENTER: this._safeString(row.COSTCENTER),
          PROFITCENTER: this._safeString(row.PROFITCENTER),
          SEGMENT: this._safeString(row.SEGMENT),
          ID: this._safeString(row.ID),
          MANAGEMENT_SUB_MAPPING: this._safeString(row.MANAGEMENT_SUB_MAPPING),
          MANAGEMENT_MAPPING: this._safeString(row.MANAGEMENT_MAPPING),
          Hierarchy: this._safeString(row.Hierarchy)
        });
      }
    }

    if (payload.length === 0) {
      this._widgetStatus = "ERROR";
      this._setMessage("Please select at least one row to save", "warning");
      this._lastEvent = JSON.stringify({
        type: "save",
        status: "NO_SELECTION",
        payloadCount: 0
      });
      this._refreshTable();
      this._fireSimpleEvent("onValidate", {
        isValid: false,
        message: "Please select at least one row to save"
      });
      return;
    }

    this._widgetStatus = "READY";
    this._setMessage(payload.length + " row(s) ready to save", "success");
    this._lastEvent = JSON.stringify({
      type: "save",
      status: "READY",
      payloadCount: payload.length,
      savePayload: payload
    });

    this._syncRows();
    this._refreshTable();
    this._fireSimpleEvent("onDataChange", {
      type: "save",
      savePayload: payload,
      rows: this._rows
    });
  };

  ProjectEntryWidget.prototype.getRows = function () {
    return JSON.stringify(this._serializeRows());
  };

  ProjectEntryWidget.prototype.setRows = function (json) {
    var raw = json;
    var newRows = [];
    var i;
    var item;
    var row;

    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch (e) {
        raw = [];
      }
    }

    if (!Array.isArray(raw)) {
      raw = [];
    }

    for (i = 0; i < raw.length; i++) {
      item = raw[i] || {};
      row = this._createEmptyRow();
      row.selected = item.selected === true;
      row.GLACCOUNT = this._safeString(item.GLACCOUNT);
      row.COSTCENTER = this._safeString(item.COSTCENTER);
      row.PROFITCENTER = this._safeString(item.PROFITCENTER);
      row.SEGMENT = this._safeString(item.SEGMENT);
      row.ID = this._safeString(item.ID || this._buildId(row));
      row.MANAGEMENT_SUB_MAPPING = this._safeString(item.MANAGEMENT_SUB_MAPPING || item["MANAGEMENT SUB-MAPPING"]);
      row.MANAGEMENT_MAPPING = this._safeString(item.MANAGEMENT_MAPPING || item["MANAGEMENT MAPPING"]);
      row.Hierarchy = this._safeString(item.Hierarchy);
      row.rowStatus = this._safeString(item.rowStatus || "READY");
      row.isModified = item.isModified === true;
      row.errors = {};
      newRows.push(row);
    }

    this._rows = newRows.length > 0 ? newRows : [this._createEmptyRow()];
    this._widgetStatus = "READY";
    this._setMessage("", "");
    this._syncRows();
    this._refreshTable();
  };

  ProjectEntryWidget.prototype.getLastEvent = function () {
    return this._lastEvent || "";
  };

  ProjectEntryWidget.prototype.getSelectedRowCount = function () {
    var count = 0;
    var i;

    for (i = 0; i < this._rows.length; i++) {
      if (this._rows[i].selected) {
        count++;
      }
    }

    return String(count);
  };

  ProjectEntryWidget.prototype.getSelectedRowValue = function (selectedIndex, fieldName) {
    var selectedRows = [];
    var i;
    var index = parseInt(selectedIndex, 10);

    for (i = 0; i < this._rows.length; i++) {
      if (this._rows[i].selected) {
        selectedRows.push(this._rows[i]);
      }
    }

    if (isNaN(index) || index < 0 || index >= selectedRows.length) {
      return "";
    }

    return this._safeString(selectedRows[index][fieldName]);
  };

  ProjectEntryWidget.prototype.getRowValue = function (rowIndex, fieldName) {
    var index = parseInt(rowIndex, 10);

    if (isNaN(index) || index < 0 || index >= this._rows.length) {
      return "";
    }

    return this._safeString(this._rows[index][fieldName]);
  };

  ProjectEntryWidget.prototype.setGLAccountOptions = function (json) {
    this._glAccountOptions = this._parseOptions(json);
    var i;
    for (i = 0; i < this._rows.length; i++) {
      this._rows[i]._rowOptions.GLACCOUNT = this._cloneOptions(this._glAccountOptions);
      this._cleanupSingleFieldSelection(this._rows[i], "GLACCOUNT");
    }
    this._refreshTable();
  };

  ProjectEntryWidget.prototype.setGlAccountOptions = function (json) {
    this.setGLAccountOptions(json);
  };

  ProjectEntryWidget.prototype.setCostCenterOptions = function (json) {
    this._costCenterOptions = this._parseOptions(json);
    var i;
    for (i = 0; i < this._rows.length; i++) {
      this._rows[i]._rowOptions.COSTCENTER = this._cloneOptions(this._costCenterOptions);
      this._cleanupSingleFieldSelection(this._rows[i], "COSTCENTER");
    }
    this._refreshTable();
  };

  ProjectEntryWidget.prototype.setProfitCenterOptions = function (json) {
    this._profitCenterOptions = this._parseOptions(json);
    var i;
    for (i = 0; i < this._rows.length; i++) {
      this._rows[i]._rowOptions.PROFITCENTER = this._cloneOptions(this._profitCenterOptions);
      this._cleanupSingleFieldSelection(this._rows[i], "PROFITCENTER");
    }
    this._refreshTable();
  };

  ProjectEntryWidget.prototype.setSegmentOptions = function (json) {
    this._segmentOptions = this._parseOptions(json);
    var i;
    for (i = 0; i < this._rows.length; i++) {
      this._rows[i]._rowOptions.SEGMENT = this._cloneOptions(this._segmentOptions);
      this._cleanupSingleFieldSelection(this._rows[i], "SEGMENT");
    }
    this._refreshTable();
  };

  ProjectEntryWidget.prototype.setHierarchyOptions = function (json) {
    this._hierarchyOptions = this._parseOptions(json);
    var i;
    for (i = 0; i < this._rows.length; i++) {
      this._rows[i]._rowOptions.Hierarchy = this._cloneOptions(this._hierarchyOptions);
      this._cleanupSingleFieldSelection(this._rows[i], "Hierarchy");
    }
    this._refreshTable();
  };

  ProjectEntryWidget.prototype.setManagementMappingOptions = function (json) {
    this._managementMappingOptions = this._parseOptions(json);
    var i;
    for (i = 0; i < this._rows.length; i++) {
      this._rows[i]._rowOptions.MANAGEMENT_MAPPING = this._cloneOptions(this._managementMappingOptions);
      this._cleanupSingleFieldSelection(this._rows[i], "MANAGEMENT_MAPPING");
    }
    this._refreshTable();
  };

  ProjectEntryWidget.prototype.setManagementSubMappingOptions = function (json) {
    this._managementSubMappingOptions = this._parseOptions(json);
    var i;
    for (i = 0; i < this._rows.length; i++) {
      this._rows[i]._rowOptions.MANAGEMENT_SUB_MAPPING = this._cloneOptions(this._managementSubMappingOptions);
      this._cleanupSingleFieldSelection(this._rows[i], "MANAGEMENT_SUB_MAPPING");
    }
    this._refreshTable();
  };

  ProjectEntryWidget.prototype.setRowFieldOptions = function (rowIndex, fieldName, json) {
    var index = parseInt(rowIndex, 10);
    var normalizedField = this._safeString(fieldName);

    if (isNaN(index)) {
      return;
    }

    if (index < 0 || index >= this._rows.length) {
      return;
    }

    if (
      normalizedField !== "GLACCOUNT" &&
      normalizedField !== "COSTCENTER" &&
      normalizedField !== "PROFITCENTER" &&
      normalizedField !== "SEGMENT" &&
      normalizedField !== "Hierarchy" &&
      normalizedField !== "MANAGEMENT_MAPPING" &&
      normalizedField !== "MANAGEMENT_SUB_MAPPING"
    ) {
      return;
    }

    var row = this._rows[index];
    var parsedOptions = this._parseOptions(json);

    this._setRowOptionsForField(row, normalizedField, parsedOptions);
    this._cleanupRowInvalidSelections(row);
    row.isModified = true;
    row.rowStatus = row.rowStatus === "NEW" ? "NEW" : "CHANGED";

    this._widgetStatus = "CHANGED";
    this._lastEvent = JSON.stringify({
      type: "rowFieldOptionsChange",
      rowIndex: index,
      field: normalizedField,
      optionCount: parsedOptions.length
    });

    this._syncRows();
    this._refreshTable();
    this._fireSimpleEvent("onDataChange", { rows: this._rows });
  };

  ProjectEntryWidget.prototype.resetRowFieldOptions = function (rowIndex, fieldName) {
    var index = parseInt(rowIndex, 10);
    var normalizedField = this._safeString(fieldName);

    if (isNaN(index)) {
      return;
    }

    if (index < 0 || index >= this._rows.length) {
      return;
    }

    var row = this._rows[index];
    this._resetRowOptionsFromMaster(row, normalizedField);
    this._cleanupRowInvalidSelections(row);

    row.isModified = true;
    row.rowStatus = row.rowStatus === "NEW" ? "NEW" : "CHANGED";

    this._widgetStatus = "CHANGED";
    this._lastEvent = JSON.stringify({
      type: "resetRowFieldOptions",
      rowIndex: index,
      field: normalizedField
    });

    this._syncRows();
    this._refreshTable();
    this._fireSimpleEvent("onDataChange", { rows: this._rows });
  };

  ProjectEntryWidget.prototype.setVisible = function (value) {
    this._visible = value !== false;
    this.style.display = this._visible ? "block" : "none";
  };

  customElements.define("com-company-managementwidget", ProjectEntryWidget);
})();
