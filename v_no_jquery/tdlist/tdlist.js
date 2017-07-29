/**
 * Created by xiangwang on 7/28/17.
 */
(function () {
    'use strict';
    var tdList = window.tdList || (window.tdList = {});

    initialize();
    function initialize() {
        var xhr = new XMLHttpRequest();
        var currentScript = document.currentScript.src;
        var currentScriptChunks = currentScript.split('/');
        var currentScriptFile = currentScriptChunks[currentScriptChunks.length - 1];
        var currentScriptPath = currentScript.replace(currentScriptFile, '');
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4) { // removed the status 200 check to make it work if opened as a file
                var template = xhr.responseText;
                tdList.lists = [];
                var elements = document.querySelectorAll(".to-do-list");
                for (var i = 0; i < elements.length; i++) {
                    elements[i].innerHTML = template;
                    tdList.lists.push(new ToDoList(elements[i]));
                }
            }
        };
        xhr.open("GET", currentScriptPath + "tdlist-template.html", true);
        xhr.setRequestHeader('Content-type', 'text/html');
        xhr.send();
    }


    function ToDoList(element) {
        var curList = this;

        curList.element = element;
        curList.data = {};
        curList.globalId = 0;

        curList.addBtn = element.querySelector('.tdlist-add-btn');
        curList.addBtn.addEventListener('click', function (e) {
            curList.addItem();
        });

        curList.addInput = element.querySelector('.tdlist-add-input');
        curList.addInput.addEventListener('keypress', function (e) {
            var key = e.which || e.keyCode;
            if (key == 13) {
                curList.addItem();
            }
        });

        curList.itemList = element.querySelector('.tdlist-item-list');
        curList.itemTemplate = curList.itemList.querySelector('.tdlist-item-template');
        curList.itemList.removeChild(curList.itemList.firstElementChild);
        curList.addItem = function () {
            var id = curList.globalId;
            curList.globalId++;
            var item = curList.itemTemplate.cloneNode(true);
            curList.data[id] = {
                id: id,
                completed: false,
                modifiable: false,
                text: curList.addInput.value,
                item: item
            };
            curList.itemList.appendChild(item);
            curList.renderItem(id, true);
            curList.addInput.value = "";
            curList.addInput.focus();
        };

        curList.renderItem = function (id, firstTime) {
            var itemData = curList.data[id];
            var item = itemData.item;
            var indexSpan = item.querySelector('.tdlist-index-span');
            var textSpan = item.querySelector('.tdlist-text-span');
            var input = item.querySelector('.tdlist-item-input');
            var check = item.querySelector('.tdlist-item-check');

            if (firstTime) {
                input.value = itemData.text;
                input.addEventListener('keypress', function (e) {
                    var key = e.which || e.keyCode;
                    if (key == 13) {
                        itemData.modifiable = false;
                        curList.renderItem(id);
                    }
                });
                var deleteBtn = item.querySelector('.tdlist-item-delete-btn');
                deleteBtn.addEventListener('click', function (e) {
                    curList.removeItem(id);
                });
                var editBtn = item.querySelector('.tdlist-item-edit-btn');
                editBtn.addEventListener('click', function (e) {
                    itemData.modifiable = !itemData.modifiable;
                    curList.renderItem(id);
                });
                check.addEventListener('click', function (e) {
                    itemData.completed = !itemData.completed;
                    itemData.modifiable = false;
                    curList.renderItem(id);
                });
            }

            itemData.text = input.value;
            indexSpan.innerText = id + ".";
            textSpan.innerText = input.value = itemData.text;
            textSpan.style.display = itemData.modifiable ? "none" : "inline";
            input.style.display = itemData.modifiable ? "inline" : "none";
            textSpan.style.textDecoration = itemData.completed ? "line-through" : "none";
            check.checked = itemData.completed;
        };

        curList.removeItem = function (id) {
            curList.itemList.removeChild(curList.data[id].item);
            delete curList.data[id];
        };
    }
})();