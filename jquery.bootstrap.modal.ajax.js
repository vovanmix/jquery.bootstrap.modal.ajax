/* ===========================================================
 * jquery.bootstrap.modal.ajax.js
 * v 0.1 14 April 2014
 * ===========================================================
 * Copyright 2014 Vladimir Mikhailovsky.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

!function ($) {

	"use strict"; // jshint ;_;
	
	var AjaxModal = {
		
		showLoading: function(){
			$('body').modalmanager('loading');
		},
		
		hideLoading: function(){
			$('body').modalmanager('loading');
			$('body').data('modalmanager').removeLoading();
		},
		
		openString: function(string){
			var $modal = $('#ajax-modal');
			
			$modal.html(string);
			
			AjaxModal.display($modal);
		},
		
		openLink: function( link, additional_content ){
			var $modal = $('#ajax-modal');
			
			AjaxModal.showLoading();
			
			$modal.load(link, '', function(){
				if(additional_content){
					$modal.append(additional_content);
				}
				AjaxModal.display($modal);
			});
		},
		
		display: function(modal){
			modal.modal().wrapInner('<div class="modal-content"></div>').prepend('<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button></div>');
		}
		
	};
	
	$.openajaxmodal = function(link) {
		AjaxModal.openLink(link);
	};
	
	$.fn.ajaxmodal = function(options) {
	
        var settings = $.extend({
            responseType: 'html', //html | json
			responseHolder: 'modal',
            processResponse: function(response) { return response;},
			actionButtons: [],
			validate: false
        }, options);
		
		if(options && options.closeButton){
			settings.actionButtons.push( {label: 'Close', type: 'close'} );
		}
		
		var addButtons = function(){
			var buttons = '<div class="buttons">';
			for(var b in settings.actionButtons){
				var buttonConfig = settings.actionButtons[b];
				var _href = '';
				if(buttonConfig.href){
					_href = buttonConfig.href;
				}
				var _class = '';
				if(buttonConfig.class){
					_class = buttonConfig.class;
				}
				var _action = '';
				if(buttonConfig.action){
					_action = buttonConfig.action;
				}

				buttons += '<a onclick="'+_action+'" class="'+_class+'" href="'+ _href +'"';

				if(buttonConfig.type === 'close'){
					buttons += ' data-dismiss="modal"';
				}

				buttons += '>'+buttonConfig.label+'</a>';
			}
			buttons += '</div>';
			
			return buttons;
		};
		
		var openAjaxModal = function(e) {
			var link = $(this).attr('href');
			
			var additional_content = '';
			
			if(settings.actionButtons.length > 0){
				var buttons = addButtons();
				additional_content += buttons;
			}
			
			AjaxModal.openLink(link, additional_content);
			return false;
		};
		
		var formAjaxModal = function(e){
			
			if(settings.validate){
				if (!$(this).valid()) {
					return false;
				}
			}
			
			var link = $(this).attr('action');
			if($(this).attr('method')){
				var method = $(this).attr('method');
			}
			else{
				method = 'get';
			}
			
			var data = $(this).serializeObject();
			
			AjaxModal.showLoading();
			
			$.ajax({
				type: method,
				url: link,
				data: data,
				context: this,
				dataType: settings.responseType,
				success: function(response) {
					
					response = settings.processResponse(response);

					if(settings.responseType === 'json'){
						var modal_content, modal_state, modal_text;
						
						if (response.success) {
							modal_state = 'success';
							modal_text = response.text;
						}
						else {
							modal_state = 'error';
							modal_text = response.text;
						}
						
						modal_content = '<div class="message-' + modal_state + '">' + modal_text + '</div></div>';
						
					}
					else{
						modal_content = response;
					}
					
					if(settings.actionButtons.length > 0){
						var buttons = addButtons();
						modal_content += buttons;
					}
					
					$(this)[0].reset();
					
					if(settings.responseHolder === 'modal'){
						AjaxModal.openString(modal_content);
					}
					else{
						AjaxModal.hideLoading();
						$('#'+settings.responseHolder).html(modal_content);
					}

				},
				error: function() {
					AjaxModal.hideLoading();
					console.log('Error occured!');
				}
			});
			
			return false;
		};
		
        return this.each(function() {
			
			if($(this).data('close_button')){
				settings.actionButtons.push( {label: 'Close', type: 'close'} );
			}
			
			if($(this).is("form")){
				$(this).bind('submit.ajaxmodal', formAjaxModal);
				
				if($(this).data('response_type')){
					settings.responseType = $(this).data('response_type');
				}
				if($(this).data('validate')){
					settings.validate = true;
				}
			}
			else{
				$(this).bind('click.ajaxmodal', openAjaxModal);
			}
        });
		
	};
	
	$(document).ready(function(){
		//adding modal container to body element
		$('body').append('<div id="ajax-modal" class="modal fade" tabindex="-1" style="display: none;"></div>');
		//define spinner
		$.fn.modal.defaults.spinner = $.fn.modalmanager.defaults.spinner = 
		'<div class="loading-spinner" style="width: 200px; margin-left: -100px;">' +
			'<div class="progress progress-striped active">' +
				'<div class="progress-bar" style="width: 100%;"></div>' +
			'</div>' +
		'</div>';

		$('.ajaxmodal').each(function(){
			$(this).ajaxmodal();
		});
	});
	
	
	
	
    var methods = {
        setValue: function(path, value, obj) {
            if (path.length) {
                var attr = path.shift();
                if (attr) {
                    obj[attr] = methods.setValue(path, value, obj[attr] || {});
                    return obj;
                } else {
                    if (obj.push) {
                        obj.push(value);
                        return obj;
                    } else {
                        return [value];
                    }
                }
            } else {
                return value;
            }
        }
    };

    $.fn.serializeObject = function() {
        var obj = {},
            params = this.serializeArray(),
            path = null;

        $.each(params, function() {
            path = this.name.replace(/\]/g, "").split(/\[/);
            methods.setValue(path, this.value, obj);
        });

        return obj;
    };
	
}(jQuery);
