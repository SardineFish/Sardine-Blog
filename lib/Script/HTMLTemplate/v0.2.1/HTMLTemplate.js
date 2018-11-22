window.HTMLTemplate = (function (HTMLTemplate)
{
    HTMLTemplate = HTMLTemplate || function (dom)
    {

    };
    //ArrayList
    function ArrayList()
    {
        var list = [];
        list.add = function (obj)
        {
            if (obj instanceof Array)
            {
                for (var i = 0; i < obj.length; i++)
                {
                    list[list.length] = obj[i];
                }
                return list.length - 1;
            }
            else
            {
                list[list.length] = obj;
                return list.length - 1;
            }
        }
        list.insert = function (obj, index)
        {
            if (isNaN(index) || index < 0)
            {
                throw new Error("Invalid index.");
            }
            for (var i = this.length-1; i >=index; i--)
            {
                this[i + 1] = this[i];
            }
            this[index] = obj;
        }
        list.removeAt = function (index)
        {
            if (isNaN(index) || index < 0 || index >= list.length)
            {
                throw new Error("Invalid index.");
            }
            for (var i = index; i < list.length - 1; i++)
            {
                list[i] = list[i + 1];
            }
            list.length -= 1;
        }
        list.remove = function (obj)
        {
            for (var i = 0; i < list.length; i++)
            {
                if (list[i] == obj)
                {
                    for (; i < list.length - 1; i++)
                    {
                        list[i] = list[i + 1];
                    }
                    list.length -= 1;
                    return;
                }
            }
            throw new Error("Object not found.");
        }
        list.clear = function ()
        {
            list.length = 0;
        }
        list.addRange = function (arr, startIndex, count)
        {
            if (!startIndex || isNaN(startIndex))
                startIndex = 0;
            if (!count || isNaN(count))
                count = arr.length;
            for (var i = startIndex; i < count; i++)
            {
                list[list.length] = arr[i];
            }
        }
        list.contain = function (obj)
        {
            return (list.indexOf(obj) >= 0);
        }
        return list;
    }
    var EventJs = (function ()
    {
        function Event()
        {
            this.def = null;
            this.handlers = ArrayList();
        }
        Event.prototype.invoke = function (args)
        {
            if (!args["handled"])
                args.handled = false;
            if (this.def)
                this.def(args);
            for (var i = 0; i < this.handlers.length; i++)
            {
                if (args.handled)
                    return;
                if (this.handlers[i])
                    this.handlers[i](args);
            }
        }
        Event.prototype.add = function (handler)
        {

            this.handlers.add(handler);
        }
        Event.prototype.remove = function (handler)
        {
            if (this.def == handler)
                this.def = null;
            this.handlers.remove(handler);
        }

        function EventManager()
        {
            this.events = {};
            this.eventNames = ArrayList();
        }
        EventManager.prototype.register = function (name, event)
        {
            if (name == undefined || name == null)
                throw new Error("A name of the event required.");
            if (this.eventNames.indexOf(name) > 0)
                throw new Error("Event existed.");
            this.events[name] = event;
            this.eventNames.add(name);
        }
        Event.EventManager = EventManager;

        /**
         * 
         * @param {Object} obj 
         * @param {String} name 
         * @param {function} [handler] 
         */
        function defineEvent(obj, name, handler)
        {
            if (!obj)
                throw new Error("An object required.");
            if (name == undefined || name == null)
                throw new Error("A name of the event required.");
            if (!obj.eventManager)
            {
                obj.eventManager = new EventManager();

            }

            if (obj.eventManager.eventNames.contain(name))
                throw new Error("Event existed.");
            var event = new Event();
            obj.eventManager.register(name);
            Object.defineProperty(obj, name, {
                get: function ()
                {
                    return event;
                },
                set: function (handler)
                {
                    event.def = handler;
                }
            })
        }
        Event.defineEvent = defineEvent;
        return Event;
    })();
    
    var globalTemplates = ArrayList();
    function Template(templateNode)
    {
        this.templateNode = templateNode;
        this.attr = ArrayList();
        this.children = ArrayList();
        this.dataSouceBinding = null;
        this.templateNode = templateNode;
        this.referTemplate = null;

        templateNode.template = this;

        var dataSource = null;

        var template = this;
        Object.defineProperty(templateNode, "dataSource", {
            get: function ()
            {
                return dataSource;
            },
            set: function (value)
            {
                if (dataSource instanceof ObserveList)
                {
                    dataSource.onInsert.remove(templateNode.onInsert);
                    dataSource.onRemove.remove(templateNode.onRemove);
                    dataSource.onChange.remove(templateNode.onChange);
                }
                dataSource = value;
                template.render(value,template.templateNode);
                if(dataSource instanceof ObserveList)
                {
                    dataSource.onInsert.add(templateNode.onInsert);
                    dataSource.onRemove.add(templateNode.onRemove);
                    dataSource.onChange.add(templateNode.onChange);
                }
            }
        });
        EventJs.defineEvent(this, "onItemAdd");
        EventJs.defineEvent(this, "onItemRemove");
        EventJs.defineEvent(this, "onItemInsert");
        
        var tNode=document.createElement("div");
        tNode.innerHTML=templateNode.innerHTML;
        //alert(templateNode.childNodes.length)
        //alert(tNode.childNodes.length);
        for (var i = 0; i<templateNode.attributes.length; i++)
        {
            if (templateNode.attributes[i].name == "datasource")
            {
                this.dataSouceBinding = new Binding(templateNode.attributes[i].value).bind;
            }
            else if (templateNode.attributes[i].name == "template")
            {
                this.referTemplate = document.getElementById(templateNode.attributes[i].value).template;
            }    
            else
            {
                this.attr.add(new AttributeTemplate(templateNode.attributes[i]));
            }
        }
        //alert(templateNode.childNodes.length+"\r\n"+templateNode.innerHTML);
        
        
        if (this.referTemplate)
        {
            this.children = this.referTemplate.children;
        }
        else
        {
            for (var i = 0; i < tNode.childNodes.length; i++)
            {
                //alert(tNode.childNodes.length);
                var child = tNode.childNodes[i];
                if (child.nodeName == "#text")
                {
                    this.children.add(new NodeTemplate(child.wholeText));
                }
                else if (child.nodeName == "TEMPLATE")
                {
                    this.children.add(new Template(child));
                }
                else
                {
                    this.children.add(new NodeTemplate(child));
                }
            }
        }
        templateNode.innerHTML = "";

        extentTemplateNode(templateNode);
        //templateNode.parentNode.replaceChild(this.present, templateNode);
    }
    Template.prototype.render = function (source,templateNode)
    {
        /*if(templateNode)
        {
            for(var i=0;templateNode.items && i<templateNode.items.length;i++)
            {
                templateNode.items[i].removeAll();
            }
            templateNode.items=ArrayList();
            var referNode=templateNode.nextSibling;
        
        }*/
        //presentNode.innerHTML = "";
        var items = ArrayList();
        if (source == null || source == undefined)
            return;
        if ((source instanceof Array)||(source instanceof ObserveList))
        {
            for (var idx = 0; idx < source.length; idx++)
            {
                    
                items.add(new TemplateItem());
                items[idx].dataSource = source[idx];
                for (var i = 0; i < this.children.length; i++)
                {
                    if (this.children[i] instanceof Template)
                    {
                        var tmpNode=this.children[i].renderTemplateNode(source[idx]);
                        //templateNode.parentNode.insertBefore(tmpNode,referNode);
                        items[idx].add(tmpNode);
                        if (!this.children[i].dataSouceBinding)
                            continue;
                        var src = eval("source[idx]." + this.children[i].dataSouceBinding);
                        var rendered=this.children[i].render(src);
                        for(var j=0;j<rendered.length;j++)
                        {
                            items[idx].add(rendered[j].nodes);
                        }
                    }
                    else
                    {
                        var node=this.children[i].render(source[idx]);
                        //templateNode.parentNode.insertBefore(node,referNode);
                        items[idx].add(node);
                    }
                }
            }
            if(source instanceof ObserveList)
            {
                function onInsert(e)
                {
                    var idx=e.index;
                    
                }
                function onRemove(e)
                {

                }
            }
        }
        else 
        {
            items.add(new TemplateItem());
            items[0].dataSource = source;
            for (var i = 0; i < this.children.length; i++)
            {
                if (this.children[i] instanceof Template)
                {
                    var tmpNode=this.children[i].renderTemplateNode(source);
                    items[0].add(tmpNode);
                    if(!this.children[i].dataSouceBinding)
                        continue;
                    var src = eval("source." + this.children[i].dataSouceBinding);
                    var rendered=this.children[i].render(src);
                    for(var j=0;j<rendered.length;j++)
                    {
                        items[0].add(rendered[j].nodes);
                    }
                    
                }
                else
                {
                    var node=this.children[i].render(source);
                    //templateNode.parentNode.insertBefore(node,referNode);
                    items[0].add(node);
                }
            }
        }
        if(templateNode)
        {
            templateNode.present(items);
        }
        return items;
    }
    Template.prototype.renderTemplateNode=function(source)
    {
        var template=document.createElement("template");
        for(var i=0;i<this.attr.length;i++)
        {
            template.setAttributeNode(this.attr[i].render(source));
        }
        template.template = this;
        extentTemplateNode(template);
        return template;
    }
    Template.prototype.toString = function ()
    {
        return "<Template>";
    }
    
    function extentTemplateNode(template)
    {
        template.items = [];
        template.present=function(items)
        {
            if(!(items instanceof Array))
                items=[items];
            template.clear();
            template.items=items;
            var referNode=template.nextSibling;
            for(var i=0;i<items.length;i++)
            {
                for(var j=0;j<items[i].nodes.length;j++)
                {
                    var node=items[i].nodes[j];
                    template.parentNode.insertBefore(node,referNode);
                }
                template.onElementRendered.invoke(items[i]);
            }
        }
        template.addItem=function(item)
        {
            var referNode = null;
            if (template.items && template.items.length > 0)
            {
                referNode = template.items[template.items.length - 1].last.nextSibling;
            }
            else
                referNode = template.nextSibling;
            if (item instanceof TemplateItem)
                item = [item];
            for (var i = 0; i < item.length; i++)
            {
                for (var j = 0; j < item[i].nodes.length; j++)
                {
                    template.parentNode.insertBefore(item[i].nodes[j], referNode);
                }
                template.onElementRendered.invoke(item[i]);
            }
        }
        template.insertItem = function (item, index)
        {
            var referNode = template.nextSibling;
            if (template.items && template.items.length>0)
            { 
                
                if (index >= template.items.length)
                    referNode = template.items[template.items.length - 1].last.nextSibling;
                else
                    referNode = template.items[index].first;
            }
            if (item instanceof TemplateItem)
                item = [item];
            for (var i = 0; i < item.length; i++)
            {
                for (var j = 0; j < item[i].nodes.length; j++)
                {
                    template.parentNode.insertBefore(item[i].nodes[j], referNode);
                }
                template.items.insert(item[i], index++);
                template.onElementRendered.invoke(item[i]);
            }
        }
        template.removeItem = function (index)
        {
            if (template.items[index])
            {
                for (var i = 0; i < template.items[index].nodes.length; i++)
                {
                    var item = template.items[index].nodes[i];
                    item.parentNode.removeChild(item);
                }
                template.items.removeAt(index);
            }
        }
        template.clear=function()
        {
            if(!template.items || !template.parentNode)
                return;
            for(var i=0;i<template.items.length;i++)
            {
                for (var j = 0; j < template.items[i].nodes.length; j++)
                {
                    template.parentNode.removeChild(template.items[i].nodes[j]);
                }
            }
        }
        template.onInsert=function(args)
        {
            var index=args.index;
            
            var sourceItem=args.item;
            var item=template.template.render(sourceItem)[0];
            template.insertItem(item, index);
        }
        template.onRemove=function(args)
        {
            var index = args.index;
            template.removeItem(index);
        }
        template.onChange=function(args)
        {
            
        }
        EventJs.defineEvent(template, "onElementRendered");
    }
    
    function TemplateItem()
    {
        this.nodes = ArrayList();
        this.dataSource = null;
        var nodes=this.nodes;
        Object.defineProperty(this, "first", {
            get: function ()
            {
                return nodes[0];
            }
        });
        Object.defineProperty(this, "last", {
            get: function ()
            {
                return nodes[nodes.length - 1];
            }
        });
        Object.defineProperty(this, "firstElement", {
            get: function ()
            {
                for (var i = 0; i < nodes.length; i++)
                {
                    if (nodes[i].nodeName != "#text")
                        return nodes[i];    
                }
            }
        });
    }
    TemplateItem.prototype.add=function(node)
    {
        this.nodes.add(node);
    }
    TemplateItem.prototype.insertBefore = function (refNode)
    {
        for (var i = 0; i < this.nodes.length; i++)
        {
            refNode.parentNode.insertBefore(this.nodes[i], refNode);
        }
    }
    TemplateItem.prototype.insertInto = function (parentNode)
    {
        for (var i = 0; i < this.nodes.length; i++)
        {
            parentNode.insertBefore(this.nodes[i], null);
        }
    }


    function NodeTemplate(dom)
    {
        this.tag = dom.localName;
        this.children = ArrayList();
        this.attr = ArrayList();
        this.text=null;
        
        if(typeof(dom)=="string")
        {
            this.text=new TextTemplate(dom);
            return;
        }
        
        for (var i = 0; dom.attributes &&  i < dom.attributes.length; i++)
        {
            this.attr.add(new AttributeTemplate(dom.attributes[i]));
        }
        for (var i = 0; i < dom.childNodes.length; i++)
        {
            var child = dom.childNodes[i];
            if (child.nodeName == "#text")
            {
                this.children.add(new NodeTemplate(child.wholeText));
            }
            else if (child.nodeName == "TEMPLATE")
            {
                this.children.add(new Template(child));
            }
            else
            {
                this.children.add(new NodeTemplate(child));
            }
        }

    }
    NodeTemplate.prototype.render = function (source)
    {
        if(this.text instanceof TextTemplate)
        {
            return document.createTextNode(this.text.render(source));
        }
        var node = document.createElement(this.tag);
        for (var i = 0; i < this.attr.length; i++)
        {
            node.setAttributeNode(this.attr[i].render(source));
        }
        for (var i = 0; i < this.children.length; i++)
        {
            if (this.children[i] instanceof Template)
            {
                var template=this.children[i].renderTemplateNode(source);
                node.appendChild(template);
                var src = eval("source." + this.children[i].dataSouceBinding);
                this.children[i].render(src,template);
            }
            else
            {
                if (this.children[i].text && this.children[i].text.renderAsHTML)
                {
                    var div = document.createElement("div");
                    div.innerHTML = this.children[i].text.render(source);
                    while (div.childNodes.length>0)
                    {
                        node.appendChild(div.childNodes[0]);
                    }    
                    continue;
                }    
                node.appendChild(this.children[i].render(source));
            }
        }
        return node;
    }
    NodeTemplate.prototype.toString = function ()
    {
        return "<" + this.tag + ">";
    }

    function AttributeTemplate(attr)
    {
        this.name = attr.name;
        this.value = new TextTemplate(attr.value);
        this.raw = attr.name + "=" + attr.value;
    }
    AttributeTemplate.prototype.render = function (source)
    {
        var attr = document.createAttribute(this.name);
        attr.value = this.value.render(source);
        return attr;
    }
    AttributeTemplate.prototype.toString = function ()
    {
        return this.raw;
    }

    function TextTemplate(text)
    {
        this.raw = text;
        this.renderAsHTML = false;
        var reg = /\{[^\{\}]*\}/;
        this.combine = [];
        var part = "";
        for (var i = 0; i < text.length; i++)
        {
            if (text.charAt(i) == "{" && i + 1 < text.length && text.charAt (i+1)== "{")
            {
                if (part.length > 0)
                {
                    this.combine[this.combine.length] = part;
                    part = "";
                }
                var bindText = "";
                for (; i < text.length; i++)
                {
                    bindText += text.charAt(i);

                    if (text.charAt(i) == "}" && i - 1 > 0 && text.charAt(i - 1) == "}")
                    {
                        break;
                    }
                }
                var bind = new Binding(bindText);
                if (bind.render == BindingRender.HTML)
                    this.renderAsHTML = true;    
                this.combine[this.combine.length] = bind;
            }
            else
            {
                part += text.charAt(i);
            }
        }
        if (part.length)
        {
            this.combine[this.combine.length] = part;
        }
    }
    TextTemplate.prototype.render = function (source)
    {
        var text = "";
        for (var i = 0; i < this.combine.length; i++)
        {
            if (this.combine[i] instanceof Binding)
            {
                text += this.combine[i].exec(source);
            }
            else
                text += this.combine[i];
        }
        return text;
    }
    TextTemplate.prototype.toString = function ()
    {
        return this.raw;
    }

    var BindType = { Member: "member", Element: "element" };
    var BindingRender = { Text: "text", HTML: "html" };
    function Binding(bindingText)
    {
        this.bind = "";
        this.type = BindType.Member;
        this.render = BindingRender.Text;

        if (/\{\{([_0-9a-zA-Z\.]+)\}\}/.test(bindingText))
        {
            this.bind = /\{\{([_0-9a-zA-Z\.]+)\}\}/.exec(bindingText)[1];
        }
        else if (/\{\{\$([_0-9a-zA-Z\.]+)\$\}\}/.test(bindingText))
        {
            var value = /\{\{\$([_0-9a-zA-Z\.]+)\$\}\}/.exec(bindingText)[1].toLowerCase();
            if (value == "element")
                this.type = BindType.Element;    
        }    
        else
        {
            var data = JSON.parse(/\{(\{\S+\})\}/.exec(bindingText)[1]);
            this.bind = data.bind;
            this.render = data.render || BindingRender.Text;
            this.type = data.type || BindType.Member;
        }
    }
    Binding.prototype.exec = function (obj)
    {
        try 
        {
            var text;
            if (this.type == BindType.Member)
                text = eval("obj." + this.bind);
            else if (this.type == BindType.Element)
                text = obj.toString();    
            return text;
        }
        catch(ex)
        {

        }
        //return "";
    }

    //Init
    function Init(templateDOM)
    {
        /*
        var str = "";
        for (var key in window)
        {
                str += key + "\r\n";


        }
        document.write(str);*/
        //Init specified template
        if (templateDOM)
        {
            //Create a div to present
            var div = document.createElement("div");
            div.className = "HTMLTemplatePresentation";
            div.id = templateDOM.id;
            div.template = templateDOM;
            templateDOM.present = div;
            templateDOM.__datasource = null;
            div.onDataSourceChanged = null;
            //Set dataSource as a property
            Object.defineProperty(div, "dataSource", {
                get: function ()
                {
                    return templateDOM.__datasource;
                },
                set: function (value)
                {
                    templateDOM.__datasource = value;
                    templateDOM.present.innerHTML = "";
                    if (templateDOM.onDataSourceChanged)
                        templateDOM.onDataSourceChanged({ target: templateDOM, data: value });
                    //List binding
                    if (value instanceof Array)
                    {
                        for (var i = 0; i < value.length; i++)
                        {
                            if (!value[i])
                                continue;
                            templateDOM.present.appendChild(RenderTemplate(templateDOM, value[i]));
                        }
                    }
                        //Single object binding
                    else
                    {
                        templateDOM.present.appendChild(RenderTemplate(templateDOM, value));
                    }

                }
            });
            //Initialized mark
            templateDOM.inited = true;
            templateDOM.parentNode.replaceChild(div, templateDOM);
            globalTemplates.add(templateDOM);
        }
        //Init all template
        else
        {
            var list = [document];
            var nextList = [];
            var templateList = [];
            //BFS search all Nodes
            function SearchChildren()
            {
                nextList = [];
                if (list.length <= 0)
                    return;
                for (var i = 0; i < list.length ; i++)
                {
                    for (var j = 0; j < list[i].childNodes.length; j++)
                    {

                        if (!list[i].childNodes[j].localName)
                            continue;
                        if (list[i].childNodes[j].localName == "template")
                        {
                            var template = new Template(list[i].childNodes[j]);
                            continue;
                            var node=new Template(list[i].childNodes[j]);
                            templateList[templateList.length] = list[i].childNodes[j];
                        }
                        else
                            nextList[nextList.length] = list[i].childNodes[j];
                    }
                }
                list = nextList;
                SearchChildren();
            }
            SearchChildren();


            //Init Templates
            for (var i = 0; i < templateList.length ; i++)
            {
                Init(templateList[i]);
            }
        }
        
    }
    HTMLTemplate.Init = Init;


    function RenderTemplate(template, obj)
    {
        if (!template.inited)
            throw new Error("Template has not initialized.");
        if (!obj)
            obj = {};
        var html = template.innerHTML.toString();
        var reg = /\{\s*(\S+)\s*\}/;
        for (var match = reg.exec(html) ; match; match = reg.exec(html))
        {
            if (match.length < 2)
                continue;
            var key = match[1];
            html = html.replace("{" + key + "}", obj[key]);
        }
        html = html.replace("{+", "{");
        html = html.replace("+}", "}");
        var div = document.createElement("div");
        div.className = "HTMLTemplateNode "+template.className;
        div.innerHTML = html;
        return div;
    }
    HTMLTemplate.RenderTemplate = RenderTemplate;

    return HTMLTemplate;
})(window.HTMLTemplate);