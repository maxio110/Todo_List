/**
 * Created by xiangwang on 7/28/17.
 * This TO-DO list module needs JQuery and Bootstrap to work as expected
 *
 * Usage : Add a <div class="to-do-list"> in the html body
 */

(function ($) {
    'use strict';
    var tdList = window.tdList || (window.tdList = {});

    initialize();
    function initialize() {
        // shared config part used to initialize all the select tags - maybe dynamically loaded
        var config = {
            priorityColorMap: {
                // prefix with number for sorting
                "1.Low": "#40e0d0",
                "2.Mid": "#ffa500",
                "3.High": "#ff6666"
            },
            orderMap: {
                "Text": 0,
                "Priority": 1,
                "Finished": 2
            }
        };
        // load template and style files from the same folder
        var currentScript = document.currentScript.src;
        var currentScriptChunks = currentScript.split('/');
        var currentScriptFile = currentScriptChunks[currentScriptChunks.length - 1];
        var currentScriptPath = currentScript.replace(currentScriptFile, '');
        $.get(currentScriptPath + "tdlist-template.html", function (template) {
            $.get(currentScriptPath + "tdlist-style.css", function (css) {
                $("<style>")
                    .prop("type", "text/css")
                    .html(css)
                    .appendTo("head");
                tdList.lists = [];
                $(".to-do-list").each(function (i) {
                    $(this).html(template);
                    var copy = $.extend({}, config);
                    copy.element = $(this);
                    tdList.lists.push(new ToDoList(copy));
                });
            });
        });
    }


    function ToDoList(config) {
        var curList = this;

        curList.data = {};
        curList.globalId = 0;
        curList.config = config;

        curList.prioritySelect = config.element.find('.tdlist-priority-select');
        initSelectWithMap(curList.prioritySelect, curList.config.priorityColorMap);

        curList.orderSelect = config.element.find('.tdlist-order-select');
        initSelectWithMap(curList.orderSelect, curList.config.orderMap);
        curList.orderSelect.on('click', function () {
            curList.orderItems($(this).val());
        });

        function initSelectWithMap(select, map) {
            for (var key in map) {
                select.append($('<option>', {
                    value: key,
                    text: key
                }));
            }
        }

        curList.addBtn = config.element.find('.tdlist-add-btn');
        curList.addBtn.on('click', function (e) {
            curList.addItem();
        });

        curList.addInput = config.element.find('.tdlist-add-input');
        curList.addInput.on('keypress', function (e) {
            var key = e.which || e.keyCode;
            if (key == 13) {
                curList.addItem();
            }
        });

        curList.removeCompletedBtn = config.element.find('.tdlist-remove-completed-btn');
        curList.removeCompletedBtn.on('click', function (e) {
            for (var id in curList.data) {
                if (curList.data[id].completed) {
                    curList.removeItem(curList.data[id].item);
                }
            }
        });

        curList.itemList = config.element.find('.tdlist-item-list');
        curList.itemTemplate = curList.itemList.find('.tdlist-item-template');
        curList.itemTemplate.remove();
        curList.addItem = function () {
            var id = curList.globalId;
            curList.globalId++;
            var item = curList.itemTemplate.clone();
            item.prop('id', id);
            item.appendTo(curList.itemList);
            curList.data[id] = {
                completed: false,
                modifiable: false,
                text: curList.addInput.val(),
                item: item,
                priority: curList.prioritySelect.val()
            };
            curList.renderItem(item, true);
            curList.addInput.val("");
            curList.addInput.focus();
        };

        curList.renderItem = function (item, firstTime) {
            var id = item.attr('id');
            var itemData = curList.data[id];
            var indexSpan = item.find('.tdlist-index-span');
            var textSpan = item.find('.tdlist-text-span');
            var input = item.find('.tdlist-item-input');
            var check = item.find('.tdlist-item-check');
            var prioritySelect = item.find('.tdlist-item-priority-select');
            var itemTable = item.find('.tdlist-item-table');

            if (firstTime) {
                initSelectWithMap(prioritySelect, curList.config.priorityColorMap);
                prioritySelect.val(itemData.priority);
                input.val(itemData.text);

                input.on('keypress', function (e) {
                    var key = e.which || e.keyCode;
                    if (key == 13) {
                        itemData.modifiable = false;
                        curList.renderItem(item);
                    }
                });
                var deleteBtn = item.find('.tdlist-item-delete-btn');
                deleteBtn.on('click', function (e) {
                    curList.removeItem(item);
                });
                var editBtn = item.find('.tdlist-item-edit-btn');
                editBtn.on('click', function (e) {
                    itemData.modifiable = !itemData.modifiable;
                    curList.renderItem(item);
                });
                check.on('click', function (e) {
                    itemData.completed = !itemData.completed;
                    itemData.modifiable = false;
                    curList.renderItem(item);
                });
            }

            itemData.text = input.val();
            itemData.priority = prioritySelect.val();
            indexSpan.text(id + ".");
            textSpan.text(itemData.text);

            if (itemData.modifiable) {
                textSpan.css("display", "none");
                input.css("display", "inline");
                prioritySelect.css("display", "inline");
            } else {
                textSpan.css("display", "inline");
                input.css("display", "none");
                prioritySelect.css("display", "none");
            }
            itemTable.css("background-color", curList.config.priorityColorMap[itemData.priority]);
            // span.css("textDecoration", itemData.completed ? "line-through" : "none");
            if (itemData.completed) {
                textSpan.addClass("strike-through")
            } else {
                textSpan.removeClass("strike-through");
            }
            check.checked = itemData.completed;
        };

        curList.removeItem = function (item) {
            delete curList.data[item.attr('id')];
            item.remove();
        };

        curList.orderItemsBy = function (comparator) {
            var items = curList.itemList.children('li');
            items.sort(comparator);
            items.detach().appendTo(curList.itemList);
        };

        curList.orderItems = function (select) {
            switch (curList.config.orderMap[select]) {
                case 0:
                    // Order by Text
                    curList.orderItemsBy(function (item1, item2) {
                        var t1 = curList.data[$(item1).attr('id')].text;
                        var t2 = curList.data[$(item2).attr('id')].text;
                        return t1 > t2 ? -1 : t1 == t2 ? 0 : 1;
                    });
                    break;
                case 1:
                    // Order by Priority
                    curList.orderItemsBy(function (item1, item2) {
                        var p1 = curList.data[$(item1).attr('id')].priority;
                        var p2 = curList.data[$(item2).attr('id')].priority;
                        return p1 > p2 ? -1 : p1 == p2 ? 0 : 1;
                    });
                    break;
                case 2:
                    // Order by Finished or not
                    curList.orderItemsBy(function (item1, item2) {
                        var c1 = curList.data[$(item1).attr('id')].completed ? 1 : 0;
                        var c2 = curList.data[$(item2).attr('id')].completed ? 1 : 0;
                        return c1 > c2 ? -1 : c1 == c2 ? 0 : 1;
                    });
                    break;
            }
        }

    }
})($);
