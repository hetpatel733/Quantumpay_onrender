$(function () {
    $("#validator-output").realtimePasswordValidator({
        debug: true,
        input1: $("#password"),
        input2: $("#cpassword"),
        validators: [
            {
                regexp: ".{8,}",
                message: "Minimum 8 chars"
            },
            {
                regexp: "[a-z]",
                message: "1 lowercase"
            },
            {
                regexp: "[A-Z]",
                message: "1 uppercase"
            },
            {
                regexp: "[0-9]",
                message: "1 number"
            },
            {
                regexp: ".*[!@#$%?=*&]",
                message: "1 special char !@#$%?=*&"
            },
            {
                compare: true,
                message: "Password confirmation must be the same"
            }
        ],
        ok: function (instance) {
            console.log("ok");

            $("#submit").removeAttr("disabled");
        },
        ko: function (instance) {
            console.log("ko");
            $("#submit").attr("disabled", "");
        }
    });
});

// plugin definition
(function ($, window, document, undefined) {
    "use strict";
    var pluginName = "realtimePasswordValidator",
        defaults = {
            debug: false
        };
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function () {
            this.settings.input1.on("input", { self: this }, this.validateEvent);
            this.settings.input2.on("input", { self: this }, this.validateEvent);
        },

        validateEvent: function (event) {
            const self = event.data.self;
            const messages = [];
            let valid_count = 0;
            $(self.element).empty();
            $(self.settings.validators).each(function (index, validator) {
                let valid = false;
                if (validator.regexp)
                    valid = new RegExp(validator.regexp).test(self.settings.input1.val());
                if (validator.compare)
                    valid = self.settings.input1.val() == $(self.settings.input2).val();
                const message = $("<div>" + validator.message + "</div>");
                message.addClass(valid ? "valid" : "invalid");
                if (self.settings.input1.val().length > 0)
                    $(self.element).append(message);
                if (valid) valid_count++;
                if (this.debug)
                    console.log(
                        index,
                        self.settings.input1.val(),
                        validator.message,
                        valid
                    );
            });
            if (valid_count == self.settings.validators.length) {
                if (self.settings.ok) self.settings.ok(self);
            } else {
                if (self.settings.ko) self.settings.ko(self);
            }
            if (this.debug)
                console.log(
                    "valid",
                    valid_count,
                    "of",
                    self.settings.validators.length
                );
        }
    });

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };
})(jQuery, window, document);
