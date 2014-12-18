<?php
/**
 * Raun
 * index-streamlined.php
 * 
 * @author Kenrick <contact@kenrick95.org>
 * @license MIT License <http://opensource.org/licenses/MIT>
 */
ob_start();
$locale = ""; $language = ""; $project = "";
$locale_force_get = false; $language_force_get = false; $project_force_get = false;
$title_info = "";
// [Need Krinkle/inuition to run: Remember to change it to correct path]
$IntuitionStartFile = 'intuition/ToolStart.php';
# $IntuitionStartFile = '/data/project/intuition/src/Intuition/ToolStart.php';

// Intuition initialization
require_once($IntuitionStartFile);
$I18N = new TsIntuition(array(
  'domain' => 'raun',
  'suppressbrackets' => true,
));

$locale = $I18N->getLang();
if (isset($_GET['userlang'])) {
    $locale_force_get = true;
}

// Decide language (of the project)
if (isset($_GET['language'])) {
    $language_force_get = true;
    $language = htmlspecialchars($_GET['language']);
} else {
    if (isset($_COOKIE['language'])) {
        $language = htmlspecialchars($_COOKIE['language']);
    } else {
        $language = "id";
    }
}

// Decide the project
if (isset($_GET['project'])) {
    $project_force_get = true;
    $project = htmlspecialchars($_GET['project']);
} else {
    if (isset($_COOKIE['project'])) {
        $project = htmlspecialchars($_COOKIE['project']);
    } else {
        $project = "wikipedia";
    }
}

// Decide the page title
$title_info = ": $language.$project ($locale)";
ob_end_clean();
?><!doctype html>
<html dir="<?php echo $I18N->getDir(); ?>" lang="<?php echo $locale; ?>">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--[if IE]>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <![endif]-->
    <meta name="description" content="Raun: watch the recent changes of Wikimedia Foundation projects, live.">
    <meta name="author" content="Kenrick">
    <!-- <link rel="shortcut icon" href="img/favicon.png"> -->

    <title>ra&middot;un<?php echo $title_info; ?></title>

    <!-- CSS -->
    <link href='//fonts.googleapis.com/css?family=Ubuntu:400,700' rel='stylesheet' type='text/css'>
    <link href="//cdn.jsdelivr.net/bootstrap/3.1.1/css/bootstrap.min.css" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">
<?php
// Google Analytics
if (stripos("tools.wmflabs.org", $_SERVER["SERVER_NAME"]) !== false) {
?>
    <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        ga('create', 'UA-49036729-2', 'wmflabs.org');
        ga('send', 'pageview');
    </script>
<?php
}
?>
</head>
<body>
    <div id="header" class="navbar navbar-default navbar-fixed-top" role="navigation">
        <div class="container">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand">ra&middot;un<span id="stat"></span></a>
            </div>

            <div class="collapse navbar-collapse">
                <ul class="nav navbar-nav">
                    <li>
                    <?php
                    // Help
                    ?>
                        <a href="#help" data-toggle="modal" data-target="#help">
                            <span class="glyphicon glyphicon-question-sign"></span>
                            <?php echo $I18N->msg( 'help' ); ?>
                        </a>
                    </li>

                    <li class="dropdown">
                    <?php
                    // Filter
                    ?>
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                            <span class="glyphicon glyphicon-filter"></span>
                            <?php echo $I18N->msg( 'filter' ); ?>
                            <b class="caret"></b>
                        </a>
                        <div class="dropdown-menu keep-open">
                            <?php echo $I18N->msg( 'settings_show' ); ?>:
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="show_bot" class="config" value="true">
                                    <span class="label label-info"><?php echo $I18N->msg( 'settings_bot_edits' ); ?></span>
                                </label>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="show_anon" class="config" value="true">
                                    <span class="label label-danger"><?php echo $I18N->msg( 'settings_anon_edits' ); ?></span>
                                </label>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="show_minor" class="config" value="true">
                                    <span class="label label-primary"><?php echo $I18N->msg( 'settings_minor_edits' ); ?></span>
                                </label>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="show_redirect" class="config" value="true">
                                    <span class="label label-warning"><?php echo $I18N->msg( 'settings_redirects' ); ?></span>
                                </label>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="show_new" class="config" value="true">
                                    <span class="label label-success"><?php echo $I18N->msg( 'settings_new_pages' ); ?></span>
                                </label>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="show_editor" class="config" value="true">
                                    <span class="label label-default"><?php echo $I18N->msg( 'settings_editor_edits' ); ?></span>
                                </label>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="show_admin" class="config" value="true">
                                    <span class="label label-info"><?php echo $I18N->msg( 'settings_admin_edits' ); ?></span>
                                </label>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="show_others" class="config" value="true">
                                    <span class="label label-default"><?php echo $I18N->msg( 'settings_other_edits' ); ?></span>
                                </label>
                            </div>
                        </div>
                    </li>

                    <li class="dropdown">
                    <?php
                    // Settings
                    ?>
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                            <span class="glyphicon glyphicon-cog"></span>
                            <?php echo $I18N->msg( 'settings' ); ?>
                            <b class="caret"></b>
                        </a>
                        <div class="dropdown-menu keep-open">
                            <form id="tool_config" role="form" method="get">
                            <?php echo $I18N->msg( 'settings_wiki' ); ?>:
                            <div class="form-group">
                                <label for="language"><?php echo $I18N->msg( 'language' ); ?></label>
                                <input type="text" class="form-control config_right" name="language" id="language" placeholder="<?php echo $I18N->msg( 'language' ); ?>" value="<?php echo $language; ?>">
                            </div>

                            <div class="form-group">
                                <label for="project"><?php echo $I18N->msg( 'project' ); ?></label>
                                <input type="text" class="form-control config_right" name="project" id="project" placeholder="<?php echo $I18N->msg( 'project' ); ?>" value="<?php echo $project; ?>">
                            </div>

                            <hr>
                            <?php echo $I18N->msg( 'settings_tool' ); ?>:
                            <div class="form-group">
                                <label for="locale"><?php echo $I18N->msg( 'language' ); ?></label>
                                <input type="text" class="form-control config_right" name="userlang" id="locale" placeholder="<?php echo $I18N->msg( 'language' ); ?>" value="<?php echo $locale; ?>">
                            </div>

                            <button type="submit" class="btn-primary btn"><?php echo $I18N->msg( 'save' ); ?></button>
                            </form>
                        </div>
                    </li>
                </ul>

                <ul class="nav navbar-nav navbar-right">
                    <li>
                    <?php
                    // About
                    ?>
                    <a href="#about" data-toggle="modal" data-target="#about">
                        <span class="glyphicon glyphicon-info-sign"></span>
                        <?php echo $I18N->msg( 'about' ); ?>
                    </a>
                    </li>
                    <li class="dropdown">
                    <?php
                    // Statistics
                    ?>
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                            <span class="glyphicon glyphicon-stats"></span>
                            <?php echo $I18N->msg( 'stat' ); ?>
                            <b class="caret"></b>
                        </a>
                        <div class="dropdown-menu keep-open">
                            <div id="stat-content">
                                <div title="<?php echo $I18N->msg( 'time_utc' ); ?>" id="time-wrapper">
                                    <span class="glyphicon glyphicon-time"></span> <span id="tz"></span>
                                </div>
                                <div id="w_stat">
                                    <img src='img/loading.gif' class="loading" alt="loading">
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div><!--/.nav-collapse -->
            
        </div>
    </div>

    <div class="container">
        <div class="main list-group">
            <div id="main-table-loading"><img src='img/loading.gif' class="loading" alt="loading"></div>
        </div>
        <footer>
            <b>ra&middot;un</b>&nbsp;<i><?php echo $I18N->msg( 'def_i' ); ?></i>&nbsp;<?php echo $I18N->msg( 'def_def' ); ?>
            <br>
            <?php echo $I18N->msg( 'about_github' ,  array('variables' => array( '<a href="https://github.com/kenrick95/Raun">github.com/kenrick95/Raun</a>' ), 'parsemag' => true ) ); ?>    
        </footer>
    </div><!-- /.container -->

    <!-- Modal: Landing -->
    <div class="modal fade" id="landing" tabindex="-1" role="dialog" aria-labelledby="helpLabel" aria-hidden="true">
        <form id="tool_config" class="form-horizontal" role="form" method="get">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title" id="landingLabel"><b>ra&middot;un</b>&nbsp;<i><?php echo $I18N->msg( 'def_i' ); ?></i>&nbsp;<?php echo $I18N->msg( 'def_def' ); ?></h4>
                </div>
                <div class="modal-body">
                    <p class="lead">Welcome to <b>ra&middot;un</b>, a tool to watch the recent changes of Wikimedia Foundation projects in real time.</p>
                    <p class="lead">Choose your preference and see it in action!</p>
                    <?php echo $I18N->msg( 'settings_wiki' ); ?>:
                        <div class="form-group">
                            <label for="language" class="col-sm-2 control-label"><?php echo $I18N->msg( 'language' ); ?></label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control config_right" name="language" id="language" placeholder="<?php echo $I18N->msg( 'language' ); ?>" value="<?php echo $language; ?>">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="project" class="col-sm-2 control-label"><?php echo $I18N->msg( 'project' ); ?></label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control config_right" name="project" id="project" placeholder="<?php echo $I18N->msg( 'project' ); ?>" value="<?php echo $project; ?>">
                            </div>
                        </div>
                    <hr>
                    <?php echo $I18N->msg( 'settings_tool' ); ?>:
                        <div class="form-group">
                            <label for="locale" class="col-sm-2 control-label"><?php echo $I18N->msg( 'language' ); ?></label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control config_right" name="userlang" id="locale" placeholder="<?php echo $I18N->msg( 'language' ); ?>" value="<?php echo $locale; ?>">
                            </div>
                        </div>
                        <hr>
                        <?php
                        // Translation promotion
                        echo $I18N->getPromoBox();
                        ?>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn-primary btn btn-lg">Go!</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
        </form>
    </div><!-- /.modal -->

    <!-- Modal: Help -->
    <div class="modal fade" id="help" tabindex="-1" role="dialog" aria-labelledby="helpLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title" id="helpLabel"><b>ra&middot;un</b>:&nbsp;<?php echo $I18N->msg( 'help' ); ?></h4>
                </div>
                <div class="modal-body">
                    <p class="lead"><b>ra&middot;un</b> <i><?php echo $I18N->msg( 'def_i' ); ?></i> <?php echo $I18N->msg( 'def_def' ); ?></p>
                    <p><?php echo $I18N->msg( 'help_p1' ); ?></p>
                    <p><?php echo $I18N->msg( 'help_p3' ); ?></p>
                    <p><?php echo $I18N->msg( 'help_p4' ); ?></p>
                    <p><?php echo $I18N->msg( 'help_legend' ); ?></p>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th><?php echo $I18N->msg( 'color' ); ?>: <?php echo $I18N->msg( 'ns' ); ?></th>
                                    <th><?php echo $I18N->msg( 'color' ); ?>: <?php echo $I18N->msg( 'ns' ); ?></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="ns-help ns-0"><?php echo $I18N->msg( 'ns0' ); ?></td>
                                    <td class="ns-help ns-1"><?php echo $I18N->msg( 'ns1' ); ?></td>
                                </tr>
                                <tr>
                                    <td class="ns-help ns-2"><?php echo $I18N->msg( 'ns2' ); ?></td>
                                    <td class="ns-help ns-3"><?php echo $I18N->msg( 'ns3' ); ?></td>
                                </tr>
                                <tr>
                                    <td class="ns-help ns-4"><?php echo $I18N->msg( 'ns4' ); ?></td>
                                    <td class="ns-help ns-5"><?php echo $I18N->msg( 'ns5' ); ?></td>
                                </tr>
                                <tr>
                                    <td class="ns-help ns-6"><?php echo $I18N->msg( 'ns6' ); ?></td>
                                    <td class="ns-help ns-7"><?php echo $I18N->msg( 'ns7' ); ?></td>
                                </tr>
                                <tr>
                                    <td class="ns-help ns-8"><?php echo $I18N->msg( 'ns8' ); ?></td>
                                    <td class="ns-help ns-9"><?php echo $I18N->msg( 'ns9' ); ?></td>
                                </tr>
                                <tr>
                                    <td class="ns-help ns-10"><?php echo $I18N->msg( 'ns10' ); ?></td>
                                    <td class="ns-help ns-11"><?php echo $I18N->msg( 'ns11' ); ?></td>
                                </tr>
                                <tr>
                                    <td class="ns-help ns-12"><?php echo $I18N->msg( 'ns12' ); ?></td>
                                    <td class="ns-help ns-13"><?php echo $I18N->msg( 'ns13' ); ?></td>
                                </tr>
                                <tr>
                                    <td class="ns-help ns-14"><?php echo $I18N->msg( 'ns14' ); ?></td>
                                    <td class="ns-help ns-15"><?php echo $I18N->msg( 'ns15' ); ?></td>
                                </tr>
                                <tr>
                                    <td class="ns-help ns-100"><?php echo $I18N->msg( 'ns100' ); ?></td>
                                    <td class="ns-help ns-101"><?php echo $I18N->msg( 'ns101' ); ?></td>
                                </tr>
                            </tbody>
                        </table>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal"><?php echo $I18N->msg( 'close' ); ?></button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
    
    <!-- Modal: About -->
    <div class="modal fade" id="about" tabindex="-1" role="dialog" aria-labelledby="aboutLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title" id="aboutLabel"><b>ra&middot;un</b>:&nbsp;<?php echo $I18N->msg( 'about' ); ?></h4>
                </div>
                <div class="modal-body">
                    <p class="lead"><b>ra&middot;un</b> <i><?php echo $I18N->msg( 'def_i' ); ?></i> <?php echo $I18N->msg( 'def_def' ); ?></p>
                    <p><?php echo $I18N->msg( 'about_tool',  array('variables' => array( '<a href="http://ivan.lanin.org/ronda">Ronda</a>', 'Ivan Lanin', '<a href="http://kenrick95.org/">Kenrick</a> (<a href="http://en.wikipedia.org/wiki/User:Kenrick95">User:Kenrick95</a>)' ), 'parsemag' => true ) ); ?></p>
                    <p><span class="label label-info"><?php echo $I18N->msg( 'information' ); ?></span> <?php echo $I18N->msg( 'about_cookie' ); ?></p>
                    <p><?php echo $I18N->msg( 'credit' ); ?>:
                    </p>
                        <ul>
                            <li>Bootstrap 3.3.1</li>
                            <li>jQuery 2.1.1</li>
                            <li>Wikimedia API</li>
                            <li>Nanobar 0.0.6</li>
                            <li>Headroom.js 0.7.0</li>
                        </ul>
                    <p><?php echo $I18N->msg( 'about_license' ); ?></p>
                    <p><?php echo $I18N->msg( 'about_github' ,  array('variables' => array( '<a href="https://github.com/kenrick95/Raun">github.com/kenrick95/Raun</a>' ), 'parsemag' => true ) ); ?></p>
                    <p><a class="btn btn-info" href="https://id.wikipedia.org/w/index.php?action=edit&amp;preload=Pembicaraan_Pengguna%3AKenrick95%2FPreload%2Fen&amp;editintro=Pembicaraan_Pengguna%3AKenrick95%2FEditintro&amp;summary=&amp;nosummary=&amp;prefix=&amp;minor=&amp;section=new&amp;title=Pembicaraan+Pengguna%3AKenrick95&amp;userlang=en" target="_blank"><span class="glyphicon glyphicon-envelope"></span> <?php echo $I18N->msg( 'send_feedback' ); ?></a>
                    </p>
                    <!-- Donate -->
                    <form class="pp-donate" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                        <input type="hidden" name="cmd" value="_donations">
                        <input type="hidden" name="business" value="kenrick95@gmail.com">
                        <input type="hidden" name="item_name" value="Donation to Kenrick (@kenrick95)">
                        <input type="hidden" name="no_note" value="0">
                        <button name="submit" class="btn btn-primary"><img src="img/icon_pp.svg" alt="Donate"> Donate</button>
                        <img alt="" src="https://www.paypalobjects.com/en_GB/i/scr/pixel.gif" style="width:1px;height:1px;border:0;">
                    </form>
                    <!-- /.Donate -->
                    <br>
                    <?php
                    // Translation promotion
                    echo $I18N->getPromoBox();
                    ?>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal"><?php echo $I18N->msg( 'close' ); ?></button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <!-- JavaScript files -->
    <script src="//cdn.jsdelivr.net/g/jquery@2.1.1,bootstrap@3.3.1,nanobar@0.0.6,headroomjs@0.7.0"></script>
    <script src="//tools.wmflabs.org/intuition/load.php?env=standalone"></script>
    <script>
    intuition.load("raun", "<?php echo $locale; ?>");
    function locale_msg(msg) {
        return intuition.msg("raun", msg);
    }
    var force = {
        locale: <?php echo $locale_force_get ? 1 : 0; ?>,
        language: <?php echo $language_force_get ? 1 : 0; ?>,
        project: <?php echo $project_force_get ? 1 : 0; ?>,
    };
    </script>
    <script src="js/raun-streamlined.js"></script>
</body>
</html>
