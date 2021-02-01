$(function() {
    function get2digits(num) {
        return ('0' + num).slice(-2);
    }

    function getDate(dateObj) {
        if (dateObj instanceof Date)
            return dateObj.getFullYear() + '-' + 
                    get2digits(dateObj.getMonth() + 1) + '-' + 
                    get2digits(dateObj.getDate());
    }

    function getTime(dateObj) {
        if (dateObj instanceof Date)
            return get2digits(dateObj.getHours()) + ':' +
                    get2digits(dateObj.getMinutes()) + ':' +
                    get2digits(dateObj.getSeconds());
    }

    function convertDate() {
        $('[data-date]').each(function(index, element) {
            var dateString = $(element).data('date');
            if (dateString) {
                var date = new Date(dateString);
                console.log(getDate(date));
                $(element).html(getDate(date));
            }
        });
    }

    function convertDateTime() {
        $('[data-date-time]').each(function(index, element) {
            var dateString = $(element).data('date-time');
            if (dateString) {
                var date = new Date(dateString);
                $(element).html(getDate(date)+' '+getTime(date));
            }
        });
    }
// Autocomplete
	$.ajax({
		type : 'get',
		url : "/posts/search/autocomplete",
		dataType : "json",
		success : function(data) {
			var source = $.map(data, function(item) {
				var consonant = "";
				var conplusvo = "";
				var full = Hangul.disassemble(item).join("").replace(/ /gi, "");
				Hangul.d(item, true).forEach(function(strItem, index) {
					if(strItem[0] != " "){
						consonant += strItem[0];
					}
				});
				Hangul.d(item, true).forEach(function(strItem, index) {
					if(strItem[0] != " "){
						if(strItem.length < 3){
							conplusvo += Hangul.assemble(strItem);
						}
						else{
							conplusvo += Hangul.assemble(strItem.slice(0, 2));
						}
					}
				});
				// consonant: 한글같은 경우 자음만 모은것 exㅎㄴㄱㅌㅇㄱㅇㅈㅇㅁㅁㅇㄱ
				// conplusvo: 한글같은 경우 받침 제외 자음과 모음만 모은것 ex 하그가으겨우
				// full: 한글같은 경우 모음, 자음, 받침들이 모두 분리 된 후 다시 합쳐지고 띄어 쓴 부분은 없앤다. ex ㅎㅏㄴㄱㅡㄹ
				return {
					label : (item).replace(/ /gi, "")+ "|" + consonant + "|" + full + "|" + conplusvo,
					value : item
				}
			})
			$("#search").autocomplete({
  				source: source,
				delay: 300,
				focus: function(event, ui){
					return false;
				},
				open: function() {
					$("ul.ui-menu").width( $(this).innerWidth() );
					$('ul li div').addClass("list-group-item");
				},
				minLength: 1
			}).autocomplete("instance")._renderItem = function(ul, item) {  
				return $("<li>")
				.append( "<div>" + item.value + "</div>" )
				.appendTo(ul);
			};
		}
	});
    convertDate();
    convertDateTime();
});