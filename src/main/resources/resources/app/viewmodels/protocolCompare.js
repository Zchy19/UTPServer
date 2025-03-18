define([
  "jquery",
  "services/utilityService",
  "services/utpService",
  "services/calculateDiffService",
  "komapping",
  "services/protocolService",
  "knockout",
  "validator",
  "jsoneditor",
  "lodash",
], function (
  $,
  utilityService,
  utpService,
  calculateDiffService,
  komapping,
  protocolService,
  ko,
  validator,
  JSONEditor,
  _
) {
  function ProtocolCompareViewModel() {
    var self = this;
    this.utpService = utpService;

    this.activate = function () {};

    this.editoreditorLeft = null;
    this.editorRight = null;
    this.diff = null;
    this.diffLeft = {};
    this.diffRight = {};
    this.jsonLeft = {};
    this.jsonRight = {};

    this.BLINK_TIMEOUT = 1200;
    this.selectedDiffChange = null;

    this.tryCalculateDiff = function () {
      var diff = calculateDiffService.memoizedCalculateDiffWithMaps(
        self.jsonLeft,
        self.jsonRight
      );
      self.diffLeft = diff.diffLeft;
      self.diffRight = diff.diffRight;
      return diff;
    };

    this.handleLeftClassName = function ({ path, field, value }) {
      const key = path.length > 0 ? "/" + path.join("/") : "";
      const operation = diffLeft[key];
      if (operation) {
        return `diff-${operation}`;
      }
    };

    this.handleRightClassName = function ({ path, field, value }) {
      const key = path.length > 0 ? "/" + path.join("/") : "";
      const operation = diffRight[key];
      if (operation) {
        return `diff-${operation}`;
      }
    };

    this.handleLeftClassName = function ({ path, field, value }) {
      const key = path.length > 0 ? "/" + path.join("/") : "";
      const operation = self.diffLeft[key];
      if (operation) return `diff-${operation}`;
    };

    this.handleRightClassName = function ({ path, field, value }) {
      const key = path.length > 0 ? "/" + path.join("/") : "";
      const operation = self.diffRight[key];
      if (operation) return `diff-${operation}`;
    };

    this.initEditor = function () {
      const containerLeft = document.getElementById("containerLeft");
      const containerRight = document.getElementById("containerRight");

      const optionsLeft = {
        onClassName: self.handleLeftClassName,
        onChangeJSON: function (json) {
          self.jsonLeft = json;
          self.diff = self.tryCalculateDiff();
          self.editorRight.refresh();
        },
        mode: "view",
        modes: ["text", "view"],
        dragarea: false,
        enableSort: false,
        enableTransform: false,
        enableExtract: false,
        colorPicker: false,
        language: "zh-CN",
        onEditable: function (node) {
          if (!node.path) {
            // In modes code and text, node is empty: no path, field, or value
            // returning false makes the text area read-only
            return false;
          }
        },
      };

      const optionsRight = {
        onClassName: self.handleRightClassName,
        onChangeJSON: function (json) {
          self.jsonRight = json;
          self.diff = self.tryCalculateDiff();
          self.editorLeft.refresh();
        },
        mode: "view",
        modes: ["text", "view"],
        dragarea: false,
        enableSort: false,
        enableTransform: false,
        enableExtract: false,
        colorPicker: false,
        language: "zh-CN",
        onEditable: function (node) {
          if (!node.path) {
            // In modes code and text, node is empty: no path, field, or value
            // returning false makes the text area read-only
            return false;
          }
        },
      };

      self.diff = self.tryCalculateDiff();

      self.editorLeft = new JSONEditor(
        containerLeft,
        optionsLeft,
        self.jsonLeft
      );
      self.editorRight = new JSONEditor(
        containerRight,
        optionsRight,
        self.jsonRight
      );

      self.diffChangeIndex = self.findChangeIndex(self.selectedDiffChange);
      self.diffChangeCount =
        self.diff && self.diff.changes ? self.diff.changes.length : undefined;
    };

    this.findChangeIndex = function (selectedChange) {
      if (!selectedChange || !self.diff || !self.diff.changes) {
        return -1;
      }

      // first try an exact match
      const index = self.diff.changes.findIndex((change) =>
        isEqual(change, selectedChange)
      );
      if (index !== -1) {
        return index;
      }

      // if not found, try a less exact match, matching one of the two paths
      // this way we can often keep track on the index whilst changes have been made in the document
      return self.diff.changes.findIndex((change) => {
        return (
          isEqual(change.pathLeft, selectedChange.pathLeft) ||
          isEqual(change.pathRight, selectedChange.pathRight)
        );
      });
    };

    this.previous = function () {
      const changes = self.diff.changes;
      if (!changes) return;

      const previousIndex =
        self.diffChangeIndex > 0 ? self.diffChangeIndex - 1 : 0;
      const action = changes[previousIndex];
      if (action) {
        self.scrollToDiffChange(action);
        self.diffChangeIndex = previousIndex;
      }
    };

    this.next = function () {
      const changes = self.diff.changes;
      if (!changes) return;
      const nextIndex =
        self.diffChangeIndex < changes.length - 1
          ? self.diffChangeIndex + 1
          : changes.length - 1;

      const action = changes[nextIndex];

      if (action) {
        self.scrollToDiffChange(action);
        self.diffChangeIndex = nextIndex;
      }
    };

    this.scrollToDiffChange = function (diffChange) {
      const path =
        diffChange && Array.isArray(diffChange.pathLeft)
          ? diffChange.pathLeft
          : diffChange.pathRight;

      // setSelectedDiffChange(diffChange)
      //debug('scrollTo', path, { changes: diff.changes, path, self.editorLeft, self.editorRight })

      if (
        self.editorLeft &&
        self.editorLeft.node &&
        (diffChange.change === "delete" || diffChange.change === "update")
      ) {
        // note that we're using an unofficial API of JSONEditor here
        const node = self.editorLeft.node.findNodeByPath(diffChange.pathLeft);
        if (node) {
          node.scrollTo(() => {
            setTimeout(
              () =>
                utilityService.removeClassName(
                  node.dom.tree,
                  "blink-diff-value"
                ),
              self.BLINK_TIMEOUT
            );
          });
          utilityService.addClassName(node.dom.tree, "blink-diff-value");
        }
        //debug('left panel: scroll to node', { node, path: diffChange.pathLeft })
      }

      if (
        self.editorRight &&
        self.editorRight.node &&
        (diffChange.change === "create" || diffChange.change === "update")
      ) {
        // note that we're using an unofficial API of JSONEditor here
        const node = self.editorRight.node.findNodeByPath(diffChange.pathRight);
        //debug('right panel: scroll to node', { node, path: diffChange.pathRight })
        if (node) {
          node.scrollTo(() => {
            setTimeout(
              () =>
                utilityService.removeClassName(
                  node.dom.tree,
                  "blink-diff-value"
                ),
              self.BLINK_TIMEOUT
            );
          });
          utilityService.addClassName(node.dom.tree, "blink-diff-value");
        }
      }
    };

    this.activate = function (activeData) {
      self.jsonLeft = activeData.jsonLeft;
      self.jsonRight = activeData.jsonRight;
    };

    this.detached = function (view, parent) {
      $("#containerLeft").html("");
      $("#containerRight").html("");
    };

    this.attached = function (view, parent) {
      $("#containerLeft").html("");
      $("#containerRight").html("");
      self.initEditor();
    };
  }
  return new ProtocolCompareViewModel();
});
