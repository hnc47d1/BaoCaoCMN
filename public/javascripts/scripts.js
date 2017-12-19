
$("#menu-toggle").click(function(e) {
            e.preventDefault();
            $("#wrapper").toggleClass("toggled");
        });

   $(function () {
         $('[data-toggle~="tooltip"]').tooltip()
       })

            $('#sharingModal').on('show.bs.modal', function (event) {
              var button = $(event.relatedTarget)
              var link = button.data('link')
             
              var modal = $(this)
              modal.find('.modal-body input').val(link)
              
            })

            $('#videoModal').on('show.bs.modal', function (event) {
              var button = $(event.relatedTarget)
              var url = button.data('url')
              var name = button.data('name')
              var extension = button.data('extension')
              
              var modal = $(this)
              modal.find('.modal-title').text(name)
              modal.find('.modal-body video').attr('type', 'video/'+extension)
              modal.find('.modal-body video').attr('src', url)
            })
      
      $(document).on('click.modal.data-api', '[data-toggle!="modal"][data-toggle~="modal"]', function (e) {
            var $this = $(this)
                , href = $this.attr('href')
                , $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
                , option = $target.data('modal') ? 'toggle' : $.extend({ remote:!/#/.test(href) && href }, $target.data(), $this.data())

            e.preventDefault()

            $target
                .modal(option)
                .one('hide', function () {
                    $this.focus()
                })
            })

      $('input[type=file]').bootstrapFileInput();
    
      $(".down-icon").click(function(){
        $(".dropdown").toggle();
      });




