const CHOICE_URI = '/choice';
const RESULTS_URI = '/results';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const project = urlParams.get('prj');
console.log('prj:');
console.log(project);

// makes an ajax call to backend to get two options,
// then puts them on the page
let set_up_choice = (first) => {
    send_ajax_request('GET', CHOICE_URI + '?prj=' + project, function () {
        if (this.readyState == 4 && this.status == 200) {
            let obj;
            try {
                obj = JSON.parse(this.responseText);
                console.log('got response');
                console.log(obj);
            } catch (err) {
                $('body').prepend('<h1 class=\"center\">You\'re Done! All Pairs Completed!!</h1>');
                $('#root').hide();
                $('.option').off('click');
                send_ajax_request('GET', RESULTS_URI + '?prj=' + project, function () {
                    if (this.readyState == 4 && this.status == 200) {
                        let results;
                        try {
                            results = JSON.parse(this.responseText);
                            console.log('got results');
                            console.log(results);
                            $('.results').show();
                            for (let i = 0; i < results.length; i++){
                                $('.results').append('<p>' + results[i].title + ' (' + results[i].year + '), score: ' + results[i].score + '</p>');
                            }
                        } catch (err) {
                            console.log(err);
                        }
                    }
                });
                return;
            }

            let tally = $('#tally').attr('count');
            let out_of = obj[2].total * (obj[2].total - 1) / 2;

            // now set the two options on the page
            $('#option-1').html(obj[0].title + ' (' + obj[0].year + ')');
            $('#option-1').attr('db_id', obj[0].short_id);

            $('#option-2').html(obj[1].title + ' (' + obj[1].year + ')');
            $('#option-2').attr('db_id', obj[1].short_id);

            // click handlers, only necessary to do once on the page
            if (first){
                $('.option').click(function() {
                    // the two ids, winning and losing
                    let winning_id = $(this).attr('db_id');
                    let losing_id = $(this).siblings('.option').attr('db_id');

                    // the two titles
                    let winning_title = $(this).html();
                    winning_title = winning_title.substring(0, winning_title.lastIndexOf('(') - 1);
                    let losing_title = $(this).siblings('.option').html();
                    losing_title = losing_title.substring(0, losing_title.lastIndexOf('(') - 1);

                    // add the ids to the uri
                    let uri = CHOICE_URI + '?winner=' + winning_id + '&loser=' + losing_id;

                    send_ajax_request('POST', uri + '&prj=' + project, function () {
                        if (this.readyState == 4 && this.status == 200) {
                            $('.prev-selections').prepend('<p>' + winning_title + ' defeated ' + losing_title + '</p>');
                            set_up_choice(false);
                        } else if (this.readyState == 4){
                            console.error('problem posting!');
                            $('prev-selections').prepend('<p>Error posting!</p>');
                        }
                    });
                });
            } else {
                tally++;
            }

            $('#tally').attr('count', tally);
            $('#tally').html('Choice ' + tally + ' out of ' + out_of);
        }
    });
}

let send_ajax_request = (method, uri, onreadystatechange) => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = onreadystatechange;
    xhttp.open(method, uri, true);
    xhttp.send();
}

// set up the first choice
set_up_choice(true);
