$(document).ready(function(){console.log("guide ready"),$(".show_markup").click(function(){$(this).next(".markup").toggleClass("show"),"Show Markup"==$(this).html()?$(this).html("Hide Markup"):$(this).html("Show Markup")}),$(".show_styles").click(function(){$(this).next(".styles").toggleClass("show"),"Show SCSS"==$(this).html()?$(this).html("Hide SCSS"):$(this).html("Show SCSS")}),$(".show_JS").click(function(){$(this).next(".js").toggleClass("show"),"Show Scripts"==$(this).html()?$(this).html("Hide Scripts"):$(this).html("Show Scripts")}),$(".alpha-toggle h3").click(function(){$(".alpha").toggleClass("show"),"Show 10% Alpha scale colors"==$(this).html()?$(this).html("Hide 10% Alpha scale colors"):$(this).html("Show 10% Alpha scale colors")}),$(".shades-toggle h3").click(function(){$(".shades").toggleClass("show"),"Show Shade colors"==$(this).html()?$(this).html("Hide Shade colors"):$(this).html("Show Shade colors")}),$(".sizes .container-small").click(function(){$(".container").toggleClass("small"),$(".container").removeClass("medium")}),$(".sizes .container-medium").click(function(){$(".container").toggleClass("medium"),$(".container").removeClass("small")}),$(".sizes .container-large").click(function(){$(".container").removeClass("small"),$(".container").removeClass("medium")})});