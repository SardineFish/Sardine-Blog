window.HTMLTemplate = (function (HTMLTemplate)
{
    HTMLTemplate = HTMLTemplate || function () { };
    var globalTemplates = (function ()
    {
        var list = [];
        list.add = function (template)
        {
            this[this.length] = template;
            return this.length - 1;
        }
        list.remove = function (template)
        {
            var index = this.indexOf(template);
            if (index < 0)
                return;
            for (var i = index ; i < this.length - 1 ; i++)
            {
                if (i < 0)
                    return;
                this[i] = this[i] + 1;
            }
            this.length--;
            return index;
        }
        list.removeAt = function (index)
        {
            if (index < 0)
                return;
            var obj = this[index];
            for (var i = index ; i < this.length - 1 ; i++)
            {
                if (i < 0)
                    return;
                this[i] = this[i] + 1;
            }
            this.length--;
            return obj;
        }
        return list;
    })();
    function Init(templateDOM)
    {
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
        var reg = /\{\s*([_a-zA-Z0-9]+)\s*\}/;
        for (var match = reg.exec(html) ; match; match = reg.exec(html))
        {
            if (match.length < 2)
                continue;
            var key = match[1];
            html = html.replace("{" + key + "}", obj[key]);
        }
        html = html.replace(/\{\+/g, "{");
        html = html.replace(/\+\}/g, "}");
        var div = document.createElement("div");
        div.className = "HTMLTemplateNode "+template.className;
        div.innerHTML = html;
        return div;
    }
    HTMLTemplate.RenderTemplate = RenderTemplate;

    return HTMLTemplate;
})(window.HTMLTemplate);